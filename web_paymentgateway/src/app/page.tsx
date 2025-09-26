"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

// interface Product {
//   _id: string;
//   name: string;
//   description: string;
//   price: number;
//   category: string;
// }

export default function SelectItem() {
  const [products, setProducts] = useState<any[]>([]);
  const { cart, addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    }
    fetchProducts();
  }, []);

  return (
    <div className="p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-xl">Logo</h1>
        <Link href="/checkout" className="relative">
          🛒
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
            {cart.reduce((acc, item) => acc + item.quantity, 0)}
          </span>
        </Link>
      </header>

      {/* Products */}
      <div className="space-y-4">
        {products.map((p) => (
          <div key={p._id} className="flex items-center justify-between border p-3 rounded">
            <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded mr-4" />
            <div>
              <h2 className="font-semibold">{p.name}</h2>
              <p className="text-gray-600 text-sm">{p.description}</p>
              <p className="font-bold mt-1">Rp {p.price.toLocaleString()}</p>
            </div>

            
            <button
              onClick={() => addToCart(p)}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Add +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
