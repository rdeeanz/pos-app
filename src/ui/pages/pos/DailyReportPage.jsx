"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import ReportSummary from "@/ui/components/pos/ReportSummary";
import SalesTable from "@/ui/components/pos/SalesTable";

export default function DailyReportPage() {
  const [report, setReport] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch("/api/pos/daily-report");

        if (!res.ok) {
          console.error("API Error:", res.status, res.statusText);
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        setReport(json.data.summary);
        setSales(json.data.sales || []);
      } catch (err) {
        console.error("Failed to load report:", err);
        setReport({
          totalSales: 0,
          totalRevenue: 0,
          totalProfit: 0,
          cashRevenue: 0,
          cashCount: 0,
          midtransRevenue: 0,
          midtransCount: 0,
        });
        setSales([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-zinc-600">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/pos"
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                Laporan Harian
              </h1>
              <p className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
                <Calendar size={14} />
                {today}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <ReportSummary report={report} />

        {/* Tabel Transaksi */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="font-bold text-zinc-900">Riwayat Transaksi</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Semua transaksi hari ini (klik chevron untuk detail barang)
            </p>
          </div>

          <SalesTable sales={sales} />
        </div>
      </div>
    </div>
  );
}
