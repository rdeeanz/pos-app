import { prisma } from "@/data/prisma/client";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/errorCodes";
import { getSnapClient } from "@/data/providers/midtrans/midtransClient";

function extractSaleIdFromUrl(url) {
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("sales");
  if (idx === -1) return null;
  return parts[idx + 1] || null;
}

export async function createQrisPaymentForSale({ saleId, cashierId }) {
  const id = String(saleId || "").trim();
  if (!id) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "saleId is required", 400);
  }

  // 1) Validate sale
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { items: true, payments: true },
  });

  if (!sale) throw new AppError(ERROR_CODES.SALE_NOT_FOUND, "Sale not found", 404);
  if (sale.status !== "PENDING") {
    throw new AppError(ERROR_CODES.SALE_ALREADY_PAID, `Sale status is ${sale.status}`, 409);
  }

  // Ensure no pending payment already (unique index also enforces)
  const hasPending = sale.payments.some((p) => p.status === "PENDING");
  if (hasPending) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Sale already has pending payment", 409);
  }

  // 2) Create Payment PENDING first (reserve)
  // providerRef will be filled after snap token/order_id generated.
  const payment = await prisma.payment.create({
    data: {
      saleId: sale.id,
      method: "QRIS",
      provider: "MIDTRANS",
      amount: sale.total,
      status: "PENDING",
    },
  });

  // 3) Call Midtrans Snap create transaction
  // order_id must be unique on Midtrans side.
  // Use payment.id to guarantee uniqueness.
  const orderId = `PAY-${payment.id}`;

  const snap = getSnapClient();

  let snapResp;
  try {
    snapResp = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: sale.total,
      },
      credit_card: { secure: true },
      // enable payment qris
      // optionally: customer_details, item_details, etc.
    });
  } catch (e) {
    // rollback payment to FAILED if snap create failed
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    throw new AppError(ERROR_CODES.MIDTRANS_ERROR, "Failed to create Midtrans transaction", 502, {
      message: String(e?.message || e),
    });
  }

  // snapResp biasanya punya token dan redirect_url
  const qrisUrl = snapResp?.redirect_url || null;
  const providerRef = orderId; // we use order_id as providerRef for webhook correlation

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      providerRef,
      qrisUrl,
    },
  });

  return {
    saleId: sale.id,
    paymentId: payment.id,
    providerRef,
    qrisUrl,
    status: "PENDING",
    amount: sale.total,
  };
}
