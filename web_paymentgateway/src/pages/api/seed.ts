import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  // Data awal (contoh)
  const products = [
    {
      name: "Coca Cola",
      description: "Soft drink classic",
      price: 15000,
      category: "Drinks",
    },
    {
      name: "Potato Chips",
      description: "Crispy snack",
      price: 10000,
      category: "Snacks",
    },
    {
      name: "Bundle Pack",
      description: "Drink + Snack combo",
      price: 22000,
      category: "Bundle",
    },
  ];

  try {
    // Hapus dulu data lama supaya nggak dobel
    await Product.deleteMany({});
    // Insert data baru
    await Product.insertMany(products);

    res.status(200).json({ message: "✅ Seeding success!", products });
  } catch (error) {
    res.status(500).json({ message: "❌ Seeding failed", error });
  }
}
