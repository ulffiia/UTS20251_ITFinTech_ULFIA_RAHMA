"use client";

import Link from "next/link";

export default function SelectItem() {
  return (
    <div className="p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-xl">Logo</h1>
        <Link href="/checkout" className="relative">
          🛒
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
            {/* 2 */}
          </span>
        </Link>
      </header>

      {/* Search */}
      <input
        type="text"
        placeholder="Search"
        className="w-full border p-2 rounded mb-4"
      />

      {/* Categories */}
      <div className="flex gap-2 mb-4 text-sm">
        {["All", "Drinks", "Snacks", "Bundle"].map((cat) => (
          <button
            key={cat}
            className="px-3 py-1 border rounded-full hover:bg-gray-100"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between border p-3 rounded">
            <div>
              <h2 className="font-semibold">Product Name</h2>
              <p className="text-gray-600 text-sm">Short description</p>
              <p className="font-bold mt-1">$$$</p>
            </div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded">
              Add +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
