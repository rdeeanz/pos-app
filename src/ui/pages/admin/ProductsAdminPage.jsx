"use client";

import { useEffect, useMemo, useState } from "react";
import ProductsForm from "@/ui/components/admin/ProductsForm";
import ProductsToolbar from "@/ui/components/admin/ProductsToolbar";
import ProductsList from "@/ui/components/admin/ProductsList";

export default function ProductsAdminPage() {
  const [q, setQ] = useState("");
  const [data, setData] = useState({ items: [], total: 0, take: 20, skip: 0 });
  const [categories, setCategories] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    id: null,
    name: "",
    sku: "",
    barcode: "",
    price: "",
    cost: "",
    qtyOnHand: "",
    categoryId: "",
    isActive: true,
  });

  const mode = useMemo(() => (form.id ? "edit" : "create"), [form.id]);

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || "Failed load categories");
      setCategories(json.data || []);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadProducts({ skip = 0 } = {}) {
    setError(null);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("take", "20");
    params.set("skip", String(skip));

    try {
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || "Failed load products");
      setData(json.data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadProducts({ skip: 0 }), 300);
    return () => clearTimeout(t);
  }, [q]);

  function resetForm() {
    setForm({
      id: null,
      name: "",
      sku: "",
      barcode: "",
      price: "",
      cost: "",
      qtyOnHand: "",
      categoryId: "",
      isActive: true,
    });
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        sku: form.sku || null,
        barcode: form.barcode || null,
        price: Number(form.price) || 0,
        cost: Number(form.cost) || 0,
        qtyOnHand: Number(form.qtyOnHand) || 0,
        categoryId: form.categoryId || null,
        isActive: !!form.isActive,
      };

      const res = await fetch(
        form.id ? `/api/admin/products/${form.id}` : "/api/admin/products",
        {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed save");

      resetForm();
      await loadProducts({ skip: 0 });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function edit(p) {
    setForm({
      id: p.id,
      name: p.name || "",
      sku: p.sku || "",
      barcode: p.barcode || "",
      price: p.price || "",
      cost: p.cost || "",
      qtyOnHand: p.inventory?.qtyOnHand || "",
      categoryId: p.categoryId || "",
      isActive: p.isActive !== false,
    });
  }

  async function toggleStatus(p) {
    const actionText = p.isActive ? "Nonaktifkan" : "Aktifkan";
    if (!confirm(`${actionText} product ini?`)) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !p.isActive }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json.error?.message || `Failed to ${actionText}`);

      await loadProducts({ skip: data.skip });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <ProductsForm
          mode={mode}
          form={form}
          setForm={setForm}
          categories={categories}
          busy={busy}
          error={error}
          onSubmit={submit}
          onReset={resetForm}
        />
      </div>

      <div className="lg:col-span-2 space-y-4">
        <ProductsToolbar q={q} setQ={setQ} busy={busy} />

        <ProductsList
          items={data.items}
          skip={data.skip}
          take={data.take}
          total={data.total}
          busy={busy}
          onPrev={() =>
            loadProducts({ skip: Math.max(0, data.skip - data.take) })
          }
          onNext={() => loadProducts({ skip: data.skip + data.take })}
          onEdit={edit}
          onToggleStatus={toggleStatus}
        />
      </div>
    </div>
  );
}
