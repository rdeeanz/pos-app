import { prisma } from "../prisma/client.js";

export async function findActiveProductsByIds(productIds) {
  return prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      price: true,
      inventory: { select: { qtyOnHand: true } },
    },
  });
}
