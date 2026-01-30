"use client";

import { useMemo, useState } from "react";
import ProductSearch from "./ProductSearch";
import Cart from "./Cart";
import PaymentPanel from "./PaymentPanel";

export default function PosPage() {
  const [cartItems, setCartItems] = useState([]);
  const [sale, setSale] = useState(null);

  function addToCart(product) {
    setCartItems((prev) => {
      const existing = prev.find((it) => it.id === product.id);
      if (existing) {
        return prev.map((it) =>
          it.id === product.id ? { ...it, qty: it.qty + 1 } : it
        );
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, qty: 1 },
      ];
    });
  }

  function updateQty(productId, qty) {
    setCartItems((prev) =>
      prev.map((it) =>
        it.id === productId ? { ...it, qty: Math.max(1, qty) } : it
      )
    );
  }

  function removeItem(productId) {
    setCartItems((prev) => prev.filter((it) => it.id !== productId));
  }

  function clearCart() {
    setCartItems([]);
    setSale(null);
  }

  const total = useMemo(
    () => cartItems.reduce((sum, it) => sum + it.price * it.qty, 0),
    [cartItems]
  );

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">POS App</h1>
            <p className="text-sm text-zinc-500">MVP • Cash + Midtrans</p>
          </div>
          <div className="text-sm text-zinc-600">
            Total: <span className="font-semibold text-zinc-900">Rp {total}</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-12 gap-6">
        {/* Left: product catalog */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <ProductSearch onSelect={addToCart} variant="grid" />
          </div>
        </div>

        {/* Right: cart + payment */}
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <Cart
                items={cartItems}
                total={total}
                onUpdateQty={updateQty}
                onRemove={removeItem}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4">
              <PaymentPanel
                cartItems={cartItems}
                total={total}
                sale={sale}
                setSale={setSale}
                onClear={clearCart}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
