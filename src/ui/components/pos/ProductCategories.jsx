"use client";

import { useEffect, useState } from "react";

export default function ProductCategories({ activeCategory, onSelect }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        setCategories(json.data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading)
    return (
      <div className="flex gap-2 animate-pulse">
        <div className="h-8 w-20 bg-zinc-100 rounded-lg"></div>
      </div>
    );

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
          activeCategory === null
            ? "bg-zinc-900 border-zinc-900 text-white shadow-md"
            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
        }`}
      >
        Semua
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
            activeCategory === cat.id
              ? "bg-blue-600 border-blue-600 text-white shadow-md"
              : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
