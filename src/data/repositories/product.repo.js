import { prisma } from "../prisma/client.js";

export async function findProductByBarcodeOrSku(q) {
  const query = String(q || "").trim();
  if (!query) return null;

  return prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ barcode: query }, { sku: query }],
    },
    select: {
      id: true,
      name: true,
      barcode: true,
      sku: true,
      price: true,
      inventory: { select: { qtyOnHand: true } },
    },
  });
}

export async function searchProductsByName(q, limit = 20) {
  const query = String(q || "").trim();
  if (!query) return [];

  const take = Math.max(1, Math.min(Number(limit) || 20, 50));

  return prisma.product.findMany({
    where: {
      isActive: true,
      name: { contains: query, mode: "insensitive" },
    },
    orderBy: [{ name: "asc" }],
    take,
    select: {
      id: true,
      name: true,
      barcode: true,
      sku: true,
      price: true,
      inventory: { select: { qtyOnHand: true } },
    },
  });
}
