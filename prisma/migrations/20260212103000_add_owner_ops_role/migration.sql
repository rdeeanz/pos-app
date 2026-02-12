-- Add OWNER and OPS roles, replace ADMIN with OWNER
DROP TYPE IF EXISTS "Role_new";
CREATE TYPE "Role_new" AS ENUM ('OWNER', 'OPS', 'CASHIER');

ALTER TABLE "User"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "Role_new"
  USING (
    CASE
      WHEN "role"::text = 'ADMIN' THEN 'OWNER'
      WHEN "role"::text = 'CASHIER' THEN 'CASHIER'
      WHEN "role"::text = 'OPS' THEN 'OPS'
      ELSE 'CASHIER'
    END
  )::"Role_new",
  ALTER COLUMN "role" SET DEFAULT 'CASHIER';

DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
