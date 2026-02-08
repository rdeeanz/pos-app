import { prisma } from "../../data/prisma/client.js";

export async function getAdminDashboard() {
  // Get today's range
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Get month's range
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Today's sales
  const todaySales = await prisma.sale.findMany({
    where: {
      createdAt: { gte: startOfDay, lte: endOfDay },
      status: { not: "CANCELLED" },
    },
    include: {
      items: {
        include: {
          product: {
            select: { cost: true },
          },
        },
      },
      payments: true,
    },
  });

  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const todayCost = todaySales.reduce(
    (sum, s) =>
      sum +
      s.items.reduce(
        (itemSum, item) =>
          itemSum + item.qty * Number(item.product?.cost || 0),
        0
      ),
    0
  );
  const todayProfit = todayRevenue - todayCost;
  const todayItemsSold = todaySales.reduce(
    (sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + item.qty, 0),
    0
  );

  // Month's sales
  const monthSales = await prisma.sale.findMany({
    where: {
      createdAt: { gte: startOfMonth },
      status: { not: "CANCELLED" },
    },
    include: {
      items: {
        include: {
          product: {
            select: { cost: true },
          },
        },
      },
    },
  });

  const monthRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);
  const monthCost = monthSales.reduce(
    (sum, s) =>
      sum +
      s.items.reduce(
        (itemSum, item) =>
          itemSum + item.qty * Number(item.product?.cost || 0),
        0
      ),
    0
  );
  const monthProfit = monthRevenue - monthCost;

  // Top products (this month) by revenue
  const topProductsByRevenue = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: {
      sale: {
        createdAt: { gte: startOfMonth },
        status: { not: "CANCELLED" },
      },
    },
    _sum: {
      qty: true,
      subtotal: true,
    },
    orderBy: {
      _sum: {
        subtotal: "desc",
      },
    },
    take: 5,
  });

  const topProductsByRevenueWithDetails = await Promise.all(
    topProductsByRevenue.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, sku: true },
      });
      return {
        ...product,
        totalSold: item._sum.qty || 0,
        revenue: item._sum.subtotal || 0,
      };
    })
  );

  // Top products (this month) by qty
  const topProductsByQty = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: {
      sale: {
        createdAt: { gte: startOfMonth },
        status: { not: "CANCELLED" },
      },
    },
    _sum: {
      qty: true,
      subtotal: true,
    },
    orderBy: {
      _sum: {
        qty: "desc",
      },
    },
    take: 5,
  });

  const topProductsByQtyWithDetails = await Promise.all(
    topProductsByQty.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, sku: true },
      });
      return {
        ...product,
        totalSold: item._sum.qty || 0,
        revenue: item._sum.subtotal || 0,
      };
    })
  );

  // Low stock products (stock <= 10)
  const lowStock = await prisma.product.findMany({
    where: {
      isActive: true,
      inventory: {
        qtyOnHand: { lte: 10 },
      },
    },
    include: {
      inventory: true,
    },
    orderBy: {
      inventory: {
        qtyOnHand: "asc",
      },
    },
    take: 10,
  });

  const lowStockMapped = lowStock.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    stock: p.inventory?.qtyOnHand || 0,
  }));

  // Recent sales (last 5)
  const recentSales = await prisma.sale.findMany({
    where: {
      createdAt: { gte: startOfDay },
    },
    include: {
      items: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentSalesMapped = recentSales.map((s) => ({
    id: s.id,
    createdAt: s.createdAt,
    total: s.total,
    itemCount: s.items.length,
    paymentMethod: s.payments[0]?.method === "CASH" ? "CASH" : "QRIS",
  }));

  return {
    today: {
      revenue: todayRevenue,
      cost: todayCost,
      profit: todayProfit,
      transactions: todaySales.length,
      itemsSold: todayItemsSold,
    },
    month: {
      revenue: monthRevenue,
      cost: monthCost,
      profit: monthProfit,
      transactions: monthSales.length,
    },
    topProductsByRevenue: topProductsByRevenueWithDetails,
    topProductsByQty: topProductsByQtyWithDetails,
    lowStock: lowStockMapped,
    lowStockCount: lowStock.length,
    recentSales: recentSalesMapped,
  };
}
