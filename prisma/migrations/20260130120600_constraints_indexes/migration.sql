-- 1) CHECK constraints
ALTER TABLE "Product"
  ADD CONSTRAINT product_price_nonnegative CHECK ("price" >= 0);

ALTER TABLE "Product"
  ADD CONSTRAINT product_cost_nonnegative CHECK ("cost" IS NULL OR "cost" >= 0);

ALTER TABLE "Inventory"
  ADD CONSTRAINT inventory_qty_nonnegative CHECK ("qtyOnHand" >= 0);

-- 2) Trigram extension + index for fast ILIKE search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS product_name_trgm_idx
  ON "Product"
  USING GIN ("name" gin_trgm_ops);

-- 3) Webhook idempotency support
CREATE UNIQUE INDEX IF NOT EXISTS payment_provider_providerref_unique
  ON "Payment" ("provider", "providerRef")
  WHERE "providerRef" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payment_one_pending_per_sale
  ON "Payment" ("saleId")
  WHERE "status" = 'PENDING';
