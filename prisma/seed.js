const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1) Users
  const adminEmail = "admin@local.test";
  const cashierEmail = "cashier@local.test";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: cashierEmail },
    update: {},
    create: {
      name: "Cashier",
      email: cashierEmail,
      role: "CASHIER",
    },
  });

  // 2) Category
  const category = await prisma.category.upsert({
    where: { name: "Minuman" },
    update: {},
    create: { name: "Minuman" },
  });

  // 3) Product + Inventory
  const product = await prisma.product.upsert({
    where: { barcode: "899000000001" },
    update: {},
    create: {
      name: "Teh Botol",
      barcode: "899000000001",
      sku: "TB-01",
      price: 5000,
      cost: 3500,
      isActive: true,
      categoryId: category.id,
      inventory: {
        create: {
          qtyOnHand: 100,
        },
      },
    },
  });

  console.log("Seed complete.");
  console.log({
    adminEmail,
    cashierEmail,
    productId: product.id,
  });
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
