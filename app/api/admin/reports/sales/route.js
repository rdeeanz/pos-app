import { requireRole } from "@/domain/auth/auth.service";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";
import { getSalesReport, getPaginatedSales } from "@/domain/sales/sale.service";

export async function GET(req) {
  try {
    await requireRole(["ADMIN"]);

    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const period = searchParams.get("period") || "7days";

    // pagination mode kalau ada page/limit
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    // === 1) PAGINATION MODE ===
    if (pageParam || limitParam) {
      const page = parseInt(pageParam || "1", 10);
      const limit = parseInt(limitParam || "25", 10);

      const status = searchParams.get("status") || undefined;
      const paymentMethod = searchParams.get("paymentMethod") || undefined;

      if (page < 1 || limit < 1) {
        return Response.json(
          { error: { message: "Page and limit must be positive integers" } },
          { status: 400 }
        );
      }

      // start/end boleh optional, tapi kalau kamu butuh wajib untuk table, enforce di sini:
      // if (!startDate || !endDate) { ... }

      const result = await getPaginatedSales({
        page,
        limit,
        status,
        paymentMethod,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      // ✅ response shape untuk table
      return Response.json(
        { data: result.data, pagination: result.pagination },
        { status: 200 }
      );
    }

    // === 2) REPORT MODE ===
    if (!startDate || !endDate) {
      return Response.json(
        { error: { message: "startDate and endDate are required" } },
        { status: 400 }
      );
    }

    const report = await getSalesReport({ startDate, endDate, period });

    // ✅ response shape untuk report page
    return Response.json(
      { data: { summary: report.summary, chartData: report.chartData } },
      { status: 200 }
    );
  } catch (err) {
    return toHttpResponse(err);
  }
}
