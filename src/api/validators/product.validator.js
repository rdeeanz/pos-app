import { z } from "zod";

const GetAllProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const GetProductsByCategoryQuerySchema = z.object({
  categoryId: z.string().nullable().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const SearchProductsQuerySchema = z.object({
  q: z.string().default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().nullable().default(null),
});

const AdminSearchProductsQuerySchema = z.object({
  q: z.string().default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const AdminListProductsQuerySchema = z.object({
  q: z.string().default(""),
  take: z.coerce.number().default(20),
  skip: z.coerce.number().default(0),
  status: z.string().default(""),
  categoryId: z.string().nullable().default(null),
  stock: z.string().default(""),
});

const ProductCreateSchema = z.object({
  name: z.string().min(1, "name is required"),
  sku: z.string().nullable(),
  barcode: z.string().nullable(),
  price: z.number().finite().min(0, "price must be >= 0"),
  cost: z.number(),
  isActive: z.boolean(),
  categoryId: z.string().nullable(),
  qtyOnHand: z.number(),
});

const ProductUpdateSchema = z.object({
  name: z.string().min(1, "name is required"),
});

export function parseGetAllProductsQuery(req) {
  const { searchParams } = new URL(req.url);

  return GetAllProductsQuerySchema.parse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
}

export function parseGetProductsByCategoryQuery(req) {
  const { searchParams } = new URL(req.url);

  return GetProductsByCategoryQuerySchema.parse({
    categoryId: searchParams.get("categoryId"),
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
}

export function parseSearchProductsQuery(req) {
  const { searchParams } = new URL(req.url);

  return SearchProductsQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
  });
}

export function parseAdminSearchProductsQuery(req) {
  const { searchParams } = new URL(req.url);

  return AdminSearchProductsQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
}

export function parseAdminListProductsQuery(req) {
  const { searchParams } = new URL(req.url);

  const parsed = AdminListProductsQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    take: searchParams.get("take") ?? undefined,
    skip: searchParams.get("skip") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    stock: searchParams.get("stock") ?? undefined,
  });

  return {
    q: parsed.q.trim(),
    take: Math.min(parsed.take, 50),
    skip: Math.max(parsed.skip, 0),
    status: parsed.status.trim().toLowerCase(),
    categoryId: parsed.categoryId || null,
    stock: parsed.stock.trim().toLowerCase(),
  };
}

export function buildProductPayload(body) {
  return {
    name: (body?.name || "").trim(),
    sku: (body?.sku || "").trim() || null,
    barcode: (body?.barcode || "").trim() || null,
    price: Number(body?.price || 0),
    cost: Number(body?.cost || 0),
    isActive: body?.isActive !== false,
    categoryId: body?.categoryId || null,
    qtyOnHand: Number(body?.qtyOnHand || 0),
  };
}

export function validateProductCreatePayload(payload) {
  const result = ProductCreateSchema.safeParse(payload);

  if (!result.success) {
    return { error: { message: result.error.issues[0]?.message, status: 400 } };
  }

  return { value: result.data };
}

export function validateProductUpdatePayload(payload) {
  const result = ProductUpdateSchema.safeParse({ name: payload?.name });

  if (!result.success) {
    return { error: { message: result.error.issues[0]?.message, status: 400 } };
  }

  return { value: payload };
}

export function buildProductPatchData(body) {
  const dataUpdate = {};

  if ("isActive" in body) {
    dataUpdate.isActive = body.isActive;
  }

  if ("qtyOnHand" in body) {
    const qty = Number(body.qtyOnHand || 0);

    dataUpdate.inventory = {
      upsert: {
        create: { qtyOnHand: qty },
        update: { qtyOnHand: qty },
      },
    };
  }

  return dataUpdate;
}
