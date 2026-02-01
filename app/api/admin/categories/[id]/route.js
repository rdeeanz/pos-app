import { prisma } from "@/data/prisma/client";
import { requireRole } from "@/domain/auth/auth.service";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";

export async function PUT(req, { params }) {
  try {
    await requireRole(["ADMIN"]);

    const { id } = await params;  // ✅ Destructure dan await
    const body = await req.json();
    const name = (body?.name || "").trim();
    if (!name) return Response.json({ error: { message: "name is required" } }, { status: 400 });

    const data = await prisma.category.update({
      where: { id },
      data: { name },
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireRole(["ADMIN"]);

    const { id } = await params;  // ✅ Destructure dan await

    // NOTE: jika category sudah dipakai product, delete akan gagal (FK). Itu bagus.
    await prisma.category.delete({ where: { id } });

    return Response.json({ data: { ok: true } }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}