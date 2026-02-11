import { AppError } from "../../lib/errors/AppError.js";
import { ERROR_CODES } from "../../lib/errors/errorCodes.js";
import {
  findPaginatedActiveProducts,
} from "../../data/repositories/product.repo.js";

function toProductDto(product) {
  return {
    id: product.id,
    name: product.name,
    barcode: product.barcode,
    sku: product.sku,
    price: product.price,
    imageUrl: product.imageUrl,
    qtyOnHand: product.inventory?.qtyOnHand ?? 0,
  };
}

function toPagination({ page, limit, totalItems }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export async function searchProducts({ q, page = 1, limit = 20, categoryId }) {
  const query = String(q || "").trim();
  if (!query) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "Query parameter 'q' is required",
      400,
      [{ field: "q", message: "Required" }]
    );
  }

  const result = await findPaginatedActiveProducts({
    q: query,
    categoryId,
    page,
    limit,
  });

  return {
    data: result.items.map(toProductDto),
    pagination: toPagination(result),
  };
}

export async function getProductsByCategory({ categoryId, page = 1, limit = 20 }) {
  if (!categoryId) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "categoryId is required",
      400
    );
  }

  const result = await findPaginatedActiveProducts({
    categoryId,
    page,
    limit,
  });

  return {
    data: result.items.map(toProductDto),
    pagination: toPagination(result),
  };
}

export async function getAllProducts({ page = 1, limit = 20 }) {
  const result = await findPaginatedActiveProducts({ page, limit });

  return {
    data: result.items.map(toProductDto),
    pagination: toPagination(result),
  };
}
