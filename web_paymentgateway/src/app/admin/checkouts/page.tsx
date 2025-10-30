"use client";

import { useEffect, useState } from "react";

interface Checkout {
  _id: string;
  code: string;
  customerName: string;
  email?: string;
  phone: string;
  total: number;
  status: "pending" | "paid" | "expired" | "cancelled";
  createdAt: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface ApiResponse {
  checkouts: Checkout[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminCheckoutsPage() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCheckouts();
  }, []);

  const fetchCheckouts = async () => {
    try {
      const res = await fetch("/api/admin/checkouts");
      const data: ApiResponse = await res.json();
      setCheckouts(data.checkouts || []);
    } catch (error) {
      console.error("Gagal mengambil data checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Lunas', icon: '✓' },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending', icon: '⏳' },
      expired: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Kadaluarsa', icon: '⌛' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Dibatalkan', icon: '✕' }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Daftar Checkout</h1>
              <p className="text-slate-600 mt-1">Kelola dan pantau semua transaksi</p>
            </div>
            <button
              onClick={() => (window.location.href = "/admin")}
              className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <span>←</span>
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Total Checkout</p>
                <p className="text-2xl font-bold text-slate-900">{checkouts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✓</span>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Lunas</p>
                <p className="text-2xl font-bold text-green-700">
                  {checkouts.filter(c => c.status === 'paid').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-amber-700">
                  {checkouts.filter(c => c.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Total Revenue</p>
                <p className="text-lg font-bold text-slate-900">
                  Rp {(checkouts.reduce((sum, c) => sum + c.total, 0) / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">Riwayat Pembelian</h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Memuat data...</p>
            </div>
          ) : checkouts.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl mb-4 block">🛒</span>
              <p className="text-slate-600 font-medium">Belum ada transaksi checkout.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Kode
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Kontak
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Tanggal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {checkouts.map((checkout) => {
                    const statusConfig = getStatusConfig(checkout.status);
                    return (
                      <tr key={checkout._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                            {checkout.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {checkout.customerName}
                            </p>
                            {checkout.email && (
                              <p className="text-xs text-slate-500 mt-0.5">{checkout.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">{checkout.phone}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900">
                            Rp {checkout.total.toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            <span>{statusConfig.icon}</span>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {new Date(checkout.createdAt).toLocaleString("id-ID", {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}