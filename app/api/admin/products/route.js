import { prisma } from "@/data/prisma/client";
import { requireRole } from "@/domain/auth/auth.service";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";

export async function GET(req) {
  try {
    await requireRole(["ADMIN"]);

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const take = Math.min(Number(searchParams.get("take") || 20), 50);
    const skip = Math.max(Number(searchParams.get("skip") || 0), 0);

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { barcode: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, inventory: true },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.product.count({ where }),
    ]);

    return Response.json({ data: { items, total, take, skip } }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function POST(req) {
  try {
    await requireRole(["ADMIN"]);

    const body = await req.json();

    const payload = {
      name: (body?.name || "").trim(),
      sku: (body?.sku || "").trim() || null,
      barcode: (body?.barcode || "").trim() || null,
      price: Number(body?.price || 0),
      cost: Number(body?.cost || 0),
      isActive: body?.isActive !== false,
      categoryId: body?.categoryId || null,
      qtyOnHand: Number(body?.qtyOnHand || 0),
    };

    if (!payload.name) {
      return Response.json({ error: { message: "name is required" } }, { status: 400 });
    }
    if (!Number.isFinite(payload.price) || payload.price < 0) {
      return Response.json({ error: { message: "price must be >= 0" } }, { status: 400 });
    }

    const data = await prisma.product.create({
      data: {
        name: payload.name,
        sku: payload.sku,
        barcode: payload.barcode,
        price: payload.price,
        cost: payload.cost,
        isActive: payload.isActive,
        categoryId: payload.categoryId,
        inventory: { create: { qtyOnHand: payload.qtyOnHand } },
      },
      include: { category: true, inventory: true },
    });

    return Response.json({ data }, { status: 201 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
