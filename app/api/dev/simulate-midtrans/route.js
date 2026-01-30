import crypto from "crypto";
import { handleMidtransWebhook } from "@/domain/webhooks/midtransWebhook.service";
import { env } from "@/config/env";

function sha512(str) {
  return crypto.createHash("sha512").update(str).digest("hex");
}

export async function POST(req) {
  const body = await req.json();

  const orderId = body.orderId;
  const grossAmount = body.grossAmount;

  const statusCode = "200";
  const signature = sha512(
    `${orderId}${statusCode}${grossAmount}${env.MIDTRANS_SERVER_KEY}`
  );

  const fakeNotification = {
    order_id: orderId,
    status_code: statusCode,
    gross_amount: String(grossAmount),
    transaction_status: "settlement",
    fraud_status: "accept",
    signature_key: signature,
  };

  const data = await handleMidtransWebhook(fakeNotification);

  return Response.json({ data }, { status: 200 });
}
