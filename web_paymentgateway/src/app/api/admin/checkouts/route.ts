import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Checkout from "@/models/Checkout";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // ✅ Tipe query yang aman sesuai Checkout model
    type CheckoutQuery = {
      status?: "pending" | "paid" | "expired" | "cancelled";
    };

    const query: CheckoutQuery = {};
    if (status && status !== "ALL") {
      query.status = status as CheckoutQuery["status"];
    }

    const skip = (page - 1) * limit;

    // Fetch checkouts dengan populate
    const [checkouts, total] = await Promise.all([
      Checkout.find(query)
        .populate("userId", "name email")
        .populate("items.productId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Checkout.countDocuments(query),
    ]);

    return NextResponse.json({
      checkouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch checkouts error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data checkout" },
      { status: 500 }
    );
  }
}