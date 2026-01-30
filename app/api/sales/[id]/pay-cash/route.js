import { toHttpResponse } from "../../../../../src/lib/errors/toHttpResponse.js";
import { paySaleByCash } from "../../../../../src/domain/payments/cashPayment.service.js";

function extractSaleIdFromUrl(url) {
  // /api/sales/<id>/pay-cash
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean);

  // parts contoh: ["api","sales","<id>","pay-cash"]
  const salesIdx = parts.indexOf("sales");
  if (salesIdx === -1) return null;

  const id = parts[salesIdx + 1];
  return id || null;
}

export async function POST(req) {
  try {
    if (!process.env.DEV_CASHIER_ID) {
      throw new Error("DEV_CASHIER_ID is not set in .env.local");
    }

    const saleId = extractSaleIdFromUrl(req.url);
    const body = await req.json();

    const data = await paySaleByCash({
      saleId,
      cashierId: process.env.DEV_CASHIER_ID,
      paidAmount: body?.paidAmount,
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
