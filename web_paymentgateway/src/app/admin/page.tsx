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
} from "recharts";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => console.error("Gagal memuat analytics:", err));
  }, []);

  if (!analytics)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Memuat data analytics...</p>
      </div>
    );

  const chartData = Object.entries(analytics.salesByDate).map(
    ([date, value]) => ({
      date,
      value,
    })
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard Admin 📊
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/products")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Kelola Produk
          </button>
          <button
            onClick={() => router.push("/admin/checkouts")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Lihat Checkout
          </button>
        </div>
      </header>

      {/* Summary Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">📈 Ringkasan Analytics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total Transaksi</p>
            <h3 className="text-2xl font-semibold">{analytics.totalOrders}</h3>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Pendapatan</p>
            <h3 className="text-2xl font-semibold">
              Rp {analytics.totalRevenue.toLocaleString("id-ID")}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Produk Terjual</p>
            <h3 className="text-2xl font-semibold">
              {analytics.totalProductsSold}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Status Checkout</p>
            <h3 className="text-sm font-medium">
              Paid: {analytics.statusCount?.paid || 0}, Pending:{" "}
              {analytics.statusCount?.pending || 0}
            </h3>
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">📅 Penjualan Harian</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center">
            Belum ada data penjualan.
          </p>
        )}
      </section>
    </div>
  );
}
