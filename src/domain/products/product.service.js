import { AppError } from "../../lib/errors/AppError.js";
import { ERROR_CODES } from "../../lib/errors/errorCodes.js";
import {
  findProductByBarcodeOrSku,
  searchProductsByName,
} from "../../data/repositories/product.repo.js";

export async function searchProducts({ q, limit }) {
  const query = String(q || "").trim();
  if (!query) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "Query parameter 'q' is required",
      400,
      [{ field: "q", message: "Required" }]
    );
  }

  const exact = await findProductByBarcodeOrSku(query);
  if (exact) {
    return [
      {
        id: exact.id,
        name: exact.name,
        barcode: exact.barcode,
        sku: exact.sku,
        price: exact.price,
        qtyOnHand: exact.inventory?.qtyOnHand ?? 0,
      },
    ];
  }

  const list = await searchProductsByName(query, limit);
  return list.map((p) => ({
    id: p.id,
    name: p.name,
    barcode: p.barcode,
    sku: p.sku,
    price: p.price,
    qtyOnHand: p.inventory?.qtyOnHand ?? 0,
  }));
}
