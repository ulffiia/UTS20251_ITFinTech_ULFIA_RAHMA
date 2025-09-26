import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Checkout from "@/models/Checkout";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const checkout = await Checkout.create(body);
    
    return NextResponse.json(
      { success: true, checkout },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Checkout failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const checkouts = await Checkout.find().populate("items.productId");
    
    return NextResponse.json(
      { success: true, checkouts },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get checkouts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch checkouts" },
      { status: 500 }
    );
  }
}