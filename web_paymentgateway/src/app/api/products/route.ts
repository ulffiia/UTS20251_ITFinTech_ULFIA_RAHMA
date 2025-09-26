import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();
    console.log("✅ Database connected");

    const products = await Product.find();
    console.log(`📦 Found ${products.length} products`);

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("❌ Error in API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}