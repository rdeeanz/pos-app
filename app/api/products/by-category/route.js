import { toHttpResponse } from "@/lib/errors/toHttpResponse";
import { requireRole } from "@/domain/auth/auth.service";
import { getProductsByCategory } from "@/domain/products/product.service";

export async function GET(req) {
  try {
    await requireRole(["CASHIER", "ADMIN"]);
    
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const limit = searchParams.get("limit") || "50";

    const data = await getProductsByCategory({ categoryId, limit });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}