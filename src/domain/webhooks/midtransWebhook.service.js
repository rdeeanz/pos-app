import crypto from "crypto";
import { prisma } from "@/data/prisma/client";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/errorCodes";
import { env } from "@/config/env";

function sha512(str) {
  return crypto.createHash("sha512").update(str).digest("hex");
}

function verifyMidtransSignature(body) {
  // signature_key = sha512(order_id + status_code + gross_amount + server_key)
  const orderId = body.order_id;
  const statusCode = body.status_code;
  const grossAmount = body.gross_amount;
  const signatureKey = body.signature_key;

  const expected = sha512(`${orderId}${statusCode}${grossAmount}${env.MIDTRANS_SERVER_KEY}`);
  return expected === signatureKey;
}

export async function handleMidtransWebhook(notification) {
  if (!verifyMidtransSignature(notification)) {
    throw new AppError(ERROR_CODES.INVALID_SIGNATURE, "Invalid signature", 401);
  }

  const orderId = notification.order_id;
  const transactionStatus = notification.transaction_status; // settlement, pending, expire, cancel, deny, etc.
  const fraudStatus = notification.fraud_status;

  // Map Midtrans -> our status
  const mappedPaymentStatus = (() => {
    if (transactionStatus === "settlement" || transactionStatus === "capture") return "PAID";
    if (transactionStatus === "pending") return "PENDING";
    if (transactionStatus === "expire") return "EXPIRED";
    if (transactionStatus === "cancel" || transactionStatus === "deny") return "FAILED";
    return "PENDING";
  })();

  // Atomic processing
  return prisma.$transaction(async (tx) => {
    // Find payment by providerRef (order_id)
    const payment = await tx.payment.findFirst({
      where: {
        provider: "MIDTRANS",
        providerRef: orderId,
      },
    });

    if (!payment) {
      // unknown order_id, accept to avoid webhook retry storm
      return { ok: true, ignored: true };
    }

    // Idempotent: if already final, don't reprocess
    if (payment.status === "PAID" && mappedPaymentStatus === "PAID") {
      // store raw notification (optional)
      await tx.payment.update({
        where: { id: payment.id },
        data: { rawNotification: notification },
      });
      return { ok: true, idempotent: true };
    }

    // Update payment status + store rawNotification
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: mappedPaymentStatus,
        rawNotification: notification,
      },
    });

    // If not PAID, do not touch stock / sale (yet)
    if (mappedPaymentStatus !== "PAID") {
      return { ok: true, paymentStatus: mappedPaymentStatus };
    }

    // PAID: mark sale PAID + decrement stock + movement (same as cash)
    const sale = await tx.sale.findUnique({
      where: { id: updatedPayment.saleId },
      include: {
        items: true,
      },
    });

    if (!sale) {
      return { ok: true, ignored: true };
    }

    if (sale.status === "PAID") {
      return { ok: true, idempotent: true };
    }

    // Decrement inventory
    for (const it of sale.items) {
      await tx.inventory.update({
        where: { productId: it.productId },
        data: { qtyOnHand: { decrement: it.qty } },
      });
    }

    await tx.stockMovement.createMany({
      data: sale.items.map((it) => ({
        productId: it.productId,
        type: "SALE",
        qtyDelta: -it.qty,
        refSaleId: sale.id,
        note: "Midtrans QRIS settlement",
      })),
    });

    await tx.sale.update({
      where: { id: sale.id },
      data: { status: "PAID" },
    });

    return { ok: true, paymentStatus: "PAID", saleId: sale.id };
  });
}
