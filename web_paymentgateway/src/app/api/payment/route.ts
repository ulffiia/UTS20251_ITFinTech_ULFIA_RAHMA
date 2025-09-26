import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const payment = await Payment.create(body);
    
    return NextResponse.json(
      { 
        success: true, 
        payment,
        message: "Payment created successfully" 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Payment creation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Payment creation failed" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const payments = await Payment.find().populate("checkoutId");
    
    return NextResponse.json(
      { 
        success: true, 
        payments,
        count: payments.length 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Fetch payments error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch payments" 
      },
      { status: 500 }
    );
  }
}