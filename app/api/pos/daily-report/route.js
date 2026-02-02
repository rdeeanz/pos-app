import { requireRole } from "@/domain/auth/auth.service";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";
import { getDailyReport } from "@/domain/sales/sale.service";

export async function GET(req) {
  try {
    const user = await requireRole(["CASHIER", "ADMIN"]);
    
    // ✅ CASHIER hanya lihat transaksi sendiri, ADMIN lihat semua
    const cashierId = user.role === "CASHIER" ? user.id : null;
    
    const data = await getDailyReport({ cashierId });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}