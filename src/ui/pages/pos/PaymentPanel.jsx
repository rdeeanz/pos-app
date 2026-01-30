"use client";

import { useMemo, useState } from "react";

function formatRp(n) {
  const x = Number(n || 0);
  return `Rp ${x.toLocaleString("id-ID")}`;
}

export default function PaymentPanel({ cartItems, total, sale, setSale, onClear }) {
  const [paidAmount, setPaidAmount] = useState("");
  const paidNumber = useMemo(() => Number(paidAmount || 0), [paidAmount]);

  async function createSale() {
    const body = {
      items: cartItems.map((it) => ({ productId: it.id, qty: it.qty })),
    };

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Failed create sale");
    return json.data;
  }

  async function payCash() {
    if (cartItems.length === 0) {
      alert("Cart kosong");
      return;
    }
    if (!Number.isFinite(paidNumber) || paidNumber <= 0) {
      alert("Masukkan uang diterima yang valid");
      return;
    }
    if (paidNumber < total) {
      alert("Uang diterima kurang dari total");
      return;
    }

    let currentSale = sale;

    try {
      if (!currentSale) {
        currentSale = await createSale();
        setSale(currentSale);
      }

      const res = await fetch(`/api/sales/${currentSale.saleId}/pay-cash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paidAmount: paidNumber }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Payment failed");

      alert(`Pembayaran sukses. Kembalian: ${formatRp(json.data.change)}`);
      onClear();
      setPaidAmount("");
    } catch (e) {
      alert(e.message || "Error");
    }
  }

  return (
    <div>
      <h2 className="text-base font-semibold">Payment</h2>
      <div className="mt-2 text-sm text-zinc-600">
        Total: <span className="font-semibold text-zinc-900">{formatRp(total)}</span>
      </div>

      <div className="mt-3">
        <label className="text-xs text-zinc-500">Cash received</label>
        <input
          type="number"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
          placeholder="Contoh: 20000"
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        />
        {paidNumber > 0 && (
          <div className="mt-2 text-sm">
            Change:{" "}
            <span className="font-semibold">
              {formatRp(Math.max(0, paidNumber - total))}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={payCash}
          className="rounded-lg bg-zinc-900 text-white px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
          disabled={cartItems.length === 0}
        >
          Pay Cash
        </button>

        <button
          disabled
          className="rounded-lg border px-3 py-2 text-sm text-zinc-400"
          title="Next phase"
        >
          Pay QRIS
        </button>
      </div>
    </div>
  );
}
