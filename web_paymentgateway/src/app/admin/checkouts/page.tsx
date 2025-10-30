"use client";

import { useEffect, useState } from "react";

// ✅ Sesuaikan dengan Checkout model
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
      
      // ✅ Ambil dari data.checkouts bukan langsung data
      setCheckouts(data.checkouts || []);
    } catch (error) {
      console.error("Gagal mengambil data checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Checkout 🧾</h1>
        <button
          onClick={() => (window.location.href = "/admin")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          ← Kembali ke Dashboard
        </button>
      </header>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Riwayat Pembelian</h2>

        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Memuat data...</p>
        ) : checkouts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Belum ada transaksi checkout.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kontak
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {checkouts.map((checkout) => (
                  <tr key={checkout._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-800">
                      {checkout.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {checkout.customerName}
                      {checkout.email && (
                        <div className="text-xs text-gray-500">{checkout.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {checkout.phone}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Rp {checkout.total.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          checkout.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : checkout.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : checkout.status === "expired"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {checkout.status === "paid"
                          ? "Lunas"
                          : checkout.status === "pending"
                          ? "Pending"
                          : checkout.status === "expired"
                          ? "Kadaluarsa"
                          : "Dibatalkan"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(checkout.createdAt).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}