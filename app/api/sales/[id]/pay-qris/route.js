import { toHttpResponse } from "@/lib/errors/toHttpResponse";
import { createQrisPaymentForSale } from "@/domain/payments/qrisPayment.service";

function extractSaleIdFromUrl(url) {
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("sales");
  if (idx === -1) return null;
  return parts[idx + 1] || null;
}

export async function POST(req) {
  try {
    if (!process.env.DEV_CASHIER_ID) {
      throw new Error("DEV_CASHIER_ID is not set in .env.local");
    }

    const saleId = extractSaleIdFromUrl(req.url);

    const data = await createQrisPaymentForSale({
      saleId,
      cashierId: process.env.DEV_CASHIER_ID,
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
