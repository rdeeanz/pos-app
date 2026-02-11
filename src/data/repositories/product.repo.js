import { prisma } from "../prisma/client.js";

function normalizePage(page) {
  return Math.max(1, Number(page) || 1);
}

function normalizeLimit(limit) {
  return Math.max(1, Math.min(Number(limit) || 20, 100));
}

function buildActiveProductsWhere({ q, categoryId }) {
  const query = String(q || "").trim();
  const where = { isActive: true };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { barcode: { contains: query, mode: "insensitive" } },
      { sku: { contains: query, mode: "insensitive" } },
    ];
  }

  return where;
}

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
      imageUrl: true,
      categoryId: true, // ✅ Tambahkan ini untuk filter kategori
      inventory: { select: { qtyOnHand: true } },
    },
  });
}

export async function searchProductsByName(q, limit = 20, categoryId = null) { // ✅ Tambah categoryId
  const query = String(q || "").trim();
  if (!query) return [];

  const take = Math.max(1, Math.min(Number(limit) || 20, 50));

  // ✅ Build where clause dengan kategori
  const where = {
    isActive: true,
    name: { contains: query, mode: "insensitive" },
  };

  if (categoryId) {
    where.categoryId = categoryId; // ✅ Filter by category
  }

  return prisma.product.findMany({
    where,
    orderBy: [{ name: "asc" }],
    take,
    select: {
      id: true,
      name: true,
      barcode: true,
      sku: true,
      price: true,
      imageUrl: true,
      inventory: { select: { qtyOnHand: true } },
    },
  });
}

export async function findProductsByCategory(categoryId, limit = 50) {
  const take = Math.max(1, Math.min(Number(limit) || 50, 100));

  return prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: categoryId,
    },
    orderBy: [{ name: "asc" }],
    take,
    select: {
      id: true,
      name: true,
      barcode: true,
      sku: true,
      price: true,
      imageUrl: true,
      inventory: { select: { qtyOnHand: true } },
    },
  });
}

// ✅ Fungsi baru untuk get ALL products
export async function findAllActiveProducts(limit = 50) {
  const take = Math.max(1, Math.min(Number(limit) || 50, 100));

  return prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ name: "asc" }],
    take,
    select: {
      id: true,
      name: true,
      barcode: true,
      sku: true,
      price: true,
      imageUrl: true,
      inventory: { select: { qtyOnHand: true } },
    },
  });
}

export async function findPaginatedActiveProducts({
  q = "",
  categoryId = null,
  page = 1,
  limit = 20,
}) {
  const normalizedPage = normalizePage(page);
  const normalizedLimit = normalizeLimit(limit);
  const skip = (normalizedPage - 1) * normalizedLimit;
  const where = buildActiveProductsWhere({ q, categoryId });

  const [items, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ name: "asc" }],
      skip,
      take: normalizedLimit,
      select: {
        id: true,
        name: true,
        barcode: true,
        sku: true,
        price: true,
        imageUrl: true,
        inventory: { select: { qtyOnHand: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, totalItems, page: normalizedPage, limit: normalizedLimit };
}
