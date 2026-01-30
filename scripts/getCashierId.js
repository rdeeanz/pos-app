const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "cashier@local.test" },
  });

  if (!user) {
    console.log("cashier user not found");
    return;
  }

  console.log("Cashier ID:", user.id);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
