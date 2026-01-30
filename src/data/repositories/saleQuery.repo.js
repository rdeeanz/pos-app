export async function getSaleById(tx, saleId) {
  return tx.sale.findUnique({
    where: { id: saleId },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, barcode: true, sku: true } },
        },
      },
      payments: true,
      cashier: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}
