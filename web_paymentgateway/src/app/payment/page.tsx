"use client";

import Link from "next/link";

export default function Payment() {
  return (
    <div className="p-4">
      <header className="flex items-center mb-4">
        <Link href="/checkout" className="mr-2">←</Link>
        <h1 className="font-bold text-lg">Secure Checkout</h1>
      </header>

      {/* Shipping */}
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Shipping Address</h2>
        <div className="border p-2 rounded text-sm text-gray-600">
          John Doe <br />
          123 Main Street <br />
          City, Country
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Payment Method</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="radio" name="payment" defaultChecked />
            Credit / Debit Card
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="payment" />
            PayPal
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="payment" />
            Other (E-Wallet, Bank Transfer)
          </label>
        </div>
      </div>

      {/* Order Summary */}
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Order Summary</h2>
        <p className="flex justify-between">
          <span>Item(s)</span> <span>$3.2X</span>
        </p>
        <p className="flex justify-between">
          <span>Shipping</span> <span>$1.2X</span>
        </p>
        <p className="flex justify-between font-bold">
          <span>Total</span> <span>$3.2X</span>
        </p>
      </div>

      <button className="w-full bg-green-600 text-white py-2 rounded">
        Confirm & Pay
      </button>
    </div>
  );
}
