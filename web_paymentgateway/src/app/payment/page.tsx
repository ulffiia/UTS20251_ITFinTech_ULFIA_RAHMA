"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export default function Payment() {
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  async function handlePayment() {
    try {
      setLoading(true);

      const externalId = `ORDER-${Date.now()}`;
      const res = await fetch("/api/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, externalId }),
      });

      const data = await res.json();
      if (data.invoice_url) {
        window.location.href = data.invoice_url; // Redirect ke halaman pembayaran Xendit
      } else {
        alert("Gagal membuat invoice");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi error saat membuat invoice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4 flex items-center gap-3">
        <Link href="/checkout" className="p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-bold text-lg">Secure Checkout</h1>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>{formatIDR(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-gray-600">Pajak (10%)</span>
              <span className="font-medium">{formatIDR(tax)}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg">{formatIDR(total)}</span>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-medium text-lg transition-colors"
        >
          {loading ? "Memproses..." : "Confirm & Pay"}
        </button>
      </div>
    </div>
  );
}
