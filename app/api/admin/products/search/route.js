import { toHttpResponse } from "@/lib/errors/toHttpResponse";
import { requireRole } from "@/domain/auth/auth.service"; // ✅ Import
import { searchProducts } from "@/domain/products/product.service";

export async function GET(req) {
  try {
    await requireRole(["CASHIER", "ADMIN"]); // ✅ CASHIER & ADMIN bisa akses
    
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const limit = searchParams.get("limit") || "20";

    const data = await searchProducts({ q, limit });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}