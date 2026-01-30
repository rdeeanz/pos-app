import { createSale } from "@/domain/sales/sale.service";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";

export async function POST(req) {
  try {
    const body = await req.json();
    const items = body?.items;

    // sementara hardcode untuk local (akan kita ganti pakai DEV_CASHIER_ID)
    const cashierId = process.env.DEV_CASHIER_ID || "dev-cashier";

    const data = await createSale({ cashierId, items });
    return Response.json({ data }, { status: 201 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
