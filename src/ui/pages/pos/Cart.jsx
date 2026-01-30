"use client";

function formatRp(n) {
  const x = Number(n || 0);
  return `Rp ${x.toLocaleString("id-ID")}`;
}

export default function Cart({ items, total, onUpdateQty, onRemove }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Cart</h2>
        <div className="text-sm text-zinc-600">
          Total: <span className="font-semibold text-zinc-900">{formatRp(total)}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-3 rounded-lg bg-zinc-50 border p-4 text-sm text-zinc-600">
          Cart kosong
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-3 border rounded-lg p-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{it.name}</div>
                <div className="text-sm text-zinc-600">
                  {formatRp(it.price)} • Subtotal <span className="font-medium text-zinc-900">{formatRp(it.price * it.qty)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={it.qty}
                  onChange={(e) => onUpdateQty(it.id, Number(e.target.value))}
                  className="w-16 rounded-lg border px-2 py-1 text-sm"
                />
                <button
                  onClick={() => onRemove(it.id)}
                  className="rounded-lg border px-2 py-1 text-sm hover:bg-zinc-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
