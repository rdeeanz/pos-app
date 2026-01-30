import { AppError } from "../../lib/errors/AppError.js";
import { ERROR_CODES } from "../../lib/errors/errorCodes.js";
import { createSaleWithItems } from "../../data/repositories/sale.repo.js";
import { findActiveProductsByIds } from "../../data/repositories/productRead.repo.js";

function normalizeItems(items) {
  const map = new Map();

  for (const it of items) {
    const productId = String(it?.productId || "").trim();
    const qty = Number(it?.qty);

    if (!productId) continue;

    if (!Number.isInteger(qty) || qty <= 0) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "qty must be an integer >= 1",
        400,
        [{ field: "items.qty", message: "qty must be integer >= 1" }]
      );
    }

    map.set(productId, (map.get(productId) || 0) + qty);
  }

  return Array.from(map.entries()).map(([productId, qty]) => ({ productId, qty }));
}

export async function createSale({ cashierId, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "items is required",
      400,
      [{ field: "items", message: "Must be a non-empty array" }]
    );
  }

  const normalized = normalizeItems(items);
  if (normalized.length === 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "items is required",
      400,
      [{ field: "items", message: "Must contain at least 1 valid item" }]
    );
  }

  const productIds = normalized.map((x) => x.productId);
  const products = await findActiveProductsByIds(productIds);

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const it of normalized) {
    if (!productMap.has(it.productId)) {
      throw new AppError(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        "Product not found",
        404,
        [{ field: "items.productId", message: `Not found: ${it.productId}` }]
      );
    }
  }

  // Policy MVP: cek stok saat create sale
  for (const it of normalized) {
    const p = productMap.get(it.productId);
    const qtyOnHand = p.inventory?.qtyOnHand ?? 0;

    if (it.qty > qtyOnHand) {
      throw new AppError(
        ERROR_CODES.INSUFFICIENT_STOCK,
        `Insufficient stock for product ${p.name}`,
        409,
        [{ field: "items", message: `${p.name} stock ${qtyOnHand}, requested ${it.qty}` }]
      );
    }
  }

  const saleItems = normalized.map((it) => {
    const p = productMap.get(it.productId);
    const price = p.price;
    const subtotal = it.qty * price;

    return { productId: it.productId, qty: it.qty, price, subtotal };
  });

  const total = saleItems.reduce((sum, it) => sum + it.subtotal, 0);

  const sale = await createSaleWithItems({
    cashierId,
    total,
    saleItems,
  });

  return {
    saleId: sale.id,
    status: sale.status,
    total: sale.total,
    createdAt: sale.createdAt,
    items: sale.items.map((it) => ({
      productId: it.productId,
      name: it.product?.name,
      qty: it.qty,
      price: it.price,
      subtotal: it.subtotal,
    })),
  };
}
