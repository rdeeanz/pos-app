"use client";

import { useEffect, useMemo, useState } from "react";

function formatRp(n) {
  const x = Number(n || 0);
  return `Rp ${x.toLocaleString("id-ID")}`;
}

export default function ProductSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const canSearch = useMemo(() => query.trim().length >= 2, [query]);

  useEffect(() => {
    let active = true;

    async function run() {
      if (!canSearch) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        if (!active) return;
        setResults(json.data || []);
      } finally {
        if (active) setLoading(false);
      }
    }

    const t = setTimeout(run, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query, canSearch]);

  return (
    <div>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <h2 className="text-base font-semibold">Produk</h2>
          <p className="text-sm text-zinc-500">Cari minimal 2 huruf, lalu klik kartu untuk tambah ke cart.</p>
        </div>

        <div className="w-full max-w-sm">
          <label className="text-xs text-zinc-500">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Contoh: teh, mie, susu..."
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </div>
      </div>

      <div className="mt-4">
        {!canSearch ? (
          <div className="rounded-lg bg-zinc-50 border p-4 text-sm text-zinc-600">
            Mulai ketik untuk menampilkan katalog.
          </div>
        ) : loading ? (
          <div className="rounded-lg bg-zinc-50 border p-4 text-sm text-zinc-600">
            Loading...
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-lg bg-zinc-50 border p-4 text-sm text-zinc-600">
            Produk tidak ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                className="text-left rounded-xl border bg-white p-3 hover:shadow-sm transition"
              >
                <div className="aspect-[4/3] rounded-lg bg-zinc-100 flex items-center justify-center text-xs text-zinc-500">
                  IMG
                </div>
                <div className="mt-3">
                  <div className="font-medium line-clamp-2">{p.name}</div>
                  <div className="mt-1 text-sm text-zinc-700">{formatRp(p.price)}</div>
                  <div className="mt-2 text-xs text-zinc-500">Klik untuk tambah</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
