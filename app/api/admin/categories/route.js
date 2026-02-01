import { prisma } from "@/data/prisma/client";
import { requireRole } from "@/domain/auth/auth.service";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);

    const data = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function POST(req) {
  try {
    await requireRole(["ADMIN"]);

    const body = await req.json();
    const name = (body?.name || "").trim();
    if (!name) return Response.json({ error: { message: "name is required" } }, { status: 400 });

    const data = await prisma.category.create({ data: { name } });
    return Response.json({ data }, { status: 201 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
