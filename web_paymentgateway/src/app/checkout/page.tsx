"use client";

import Link from "next/link";

export default function Checkout() {
  return (
    <div className="p-4">
      <header className="flex items-center mb-4">
        <Link href="/" className="mr-2">← </Link>
        <h1 className="font-bold text-lg">Checkout</h1>
      </header>

      {/* Product List */}
      {[1, 2].map((i) => (
        <div key={i} className="flex justify-between items-center border-b py-2">
          <h2>Product Name</h2>
          <div className="flex items-center gap-2">
            <button className="px-2 border">-</button>
            <span>2</span>
            <button className="px-2 border">+</button>
          </div>
          <p>$$$</p>
        </div>
      ))}

      {/* Summary */}
      <div className="mt-4 space-y-1">
        <p className="flex justify-between">
          <span>Subtotal</span> <span>$339</span>
        </p>
        <p className="flex justify-between">
          <span>Tax</span> <span>$1X2</span>
        </p>
        <p className="flex justify-between font-bold">
          <span>Total</span> <span>$2.XX</span>
        </p>
      </div>

      <Link
        href="/payment"
        className="block mt-4 bg-blue-600 text-white text-center py-2 rounded"
      >
        Continue to Payment →
      </Link>
    </div>
  );
}
