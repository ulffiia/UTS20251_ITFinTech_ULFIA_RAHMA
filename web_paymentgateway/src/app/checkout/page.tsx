"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { cart, addToCart, removeFromCart } = useCart();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // contoh pajak 10%
  const total = subtotal + tax;

  return (
    <div className="p-4">
      {/* Header */}
      <header className="flex items-center mb-4">
        <Link href="/" className="mr-2">←</Link>
        <h1 className="font-bold text-lg">Checkout</h1>
      </header>

      {/* Cart Items */}
      {cart.length === 0 ? (
        <p className="text-gray-500">Keranjang kosong.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between items-center border-b py-2">
              <h2>{item.name}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="px-2 border"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="px-2 border"
                >
                  +
                </button>
              </div>
              <p>Rp {(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {cart.length > 0 && (
        <div className="mt-4 space-y-1">
          <p className="flex justify-between">
            <span>Subtotal</span> <span>Rp {subtotal.toLocaleString()}</span>
          </p>
          <p className="flex justify-between">
            <span>Tax (10%)</span> <span>Rp {tax.toLocaleString()}</span>
          </p>
          <p className="flex justify-between font-bold">
            <span>Total</span> <span>Rp {total.toLocaleString()}</span>
          </p>

          <Link
            href="/payment"
            className="block mt-4 bg-blue-600 text-white text-center py-2 rounded"
          >
            Continue to Payment →
          </Link>
        </div>
      )}
    </div>
  );
}
