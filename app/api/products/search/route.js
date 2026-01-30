import { toHttpResponse } from "../../../../src/lib/errors/toHttpResponse.js";
import { searchProducts } from "../../../../src/domain/products/product.service.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const limit = searchParams.get("limit") || "20";

    const data = await searchProducts({ q, limit });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
