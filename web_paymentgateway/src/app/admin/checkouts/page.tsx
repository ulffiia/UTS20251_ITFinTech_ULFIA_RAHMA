"use client";

import { useEffect, useState } from "react";

interface Checkout {
  _id: string;
  userEmail: string;
  totalAmount: number;
  status: "pending" | "paid";
  createdAt: string;
}

export default function AdminCheckoutsPage() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCheckouts();
  }, []);

  const fetchCheckouts = async () => {
    try {
      const res = await fetch("/api/checkouts");
      const data = await res.json();
      setCheckouts(data);
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
                    Email Pembeli
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
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {checkout.userEmail || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Rp {checkout.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm font-semibold ${
                        checkout.status === "paid"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {checkout.status === "paid" ? "Lunas" : "Menunggu Pembayaran"}
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
