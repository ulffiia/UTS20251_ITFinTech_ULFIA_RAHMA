"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type SalesByDate = Record<string, number>;
type StatusCount = Record<string, number>;

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
  statusCount?: StatusCount;
  salesByDate: SalesByDate;
}

interface ChartPoint {
  date: string;
  value: number;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data: Analytics) => setAnalytics(data))
      .catch((err) => console.error("Gagal memuat analytics:", err));
  }, []);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Memuat data analytics...</p>
        </div>
      </div>
    );
  }

  const chartData: ChartPoint[] = Object.entries(analytics.salesByDate).map(
    ([date, value]) => ({ date, value })
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard Admin</h1>
              <p className="text-slate-600 mt-1">Pantau performa bisnis Anda</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/admin/products")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
              >
                Kelola Produk
              </button>
              <button
                onClick={() => router.push("/admin/checkouts")}
                className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
              >
                Lihat Checkout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Ringkasan Analytics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Orders */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🛍️</span>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Total</span>
              </div>
              <p className="text-slate-600 text-sm font-medium mb-1">Total Transaksi</p>
              <h3 className="text-3xl font-bold text-slate-900">{analytics.totalOrders}</h3>
            </div>

            {/* Revenue */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Rupiah</span>
              </div>
              <p className="text-slate-600 text-sm font-medium mb-1">Pendapatan</p>
              <h3 className="text-3xl font-bold text-slate-900">
                Rp {(analytics.totalRevenue / 1000).toFixed(0)}K
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {analytics.totalRevenue.toLocaleString("id-ID")}
              </p>
            </div>

            {/* Products Sold */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">Unit</span>
              </div>
              <p className="text-slate-600 text-sm font-medium mb-1">Produk Terjual</p>
              <h3 className="text-3xl font-bold text-slate-900">
                {analytics.totalProductsSold}
              </h3>
            </div>

            {/* Status */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Status</span>
              </div>
              <p className="text-slate-600 text-sm font-medium mb-2">Status Checkout</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Lunas:</span>
                  <span className="font-semibold text-green-600">{analytics.statusCount?.paid ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Pending:</span>
                  <span className="font-semibold text-amber-600">{analytics.statusCount?.pending ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chart Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Penjualan Harian</h3>
              <p className="text-sm text-slate-600 mt-1">Grafik pendapatan per hari</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📅</span>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  labelStyle={{ color: '#334155', fontWeight: 600 }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">📭</span>
                <p className="text-slate-500">Belum ada data penjualan.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}