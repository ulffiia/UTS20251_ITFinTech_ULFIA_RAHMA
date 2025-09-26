import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = [
    {
      name: "Coca Cola",
      description: "Drink",
      price: 15000,
      category: "Drinks",
      image: "images/Coca-Cola-2.25-L-Bottle.jpg",
    },
    {
      name: "Japota",
      description: "Snack",
      price: 10000,
      category: "Snacks",
      image: "images/japota.webp",
    },
    {
      name: "Bundle Pack",
      description: "Drink + Snack combo",
      price: 22000,
      category: "Bundle",
      image: "images/bundle.png"
    },
  ];

    // Hapus data lama
    await Product.deleteMany({});
    // Insert data baru
    await Product.insertMany(products);

    return NextResponse.json(
      { 
        success: true,
        message: "✅ Seeding success!", 
        products 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Seeding error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "❌ Seeding failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}