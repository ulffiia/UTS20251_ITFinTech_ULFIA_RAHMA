import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Checkout from "@/models/Checkout";
import { sendWhatsapp } from "@/lib/fonnte";           // NEW

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const checkout = await Checkout.create(body);

    // --- NEW: kirim WA konfirmasi pesanan
    if (checkout?.phone) {
      const total = (checkout.total || 0).toLocaleString('id-ID');
      const code = checkout.code || checkout._id?.toString().slice(-6).toUpperCase();
      await sendWhatsapp(
        checkout.phone,
        `Terima kasih ${checkout.name || 'Kak'}, pesanan ${code} berhasil dibuat. Total: Rp ${total}.`
      );
    }

    return NextResponse.json({ success: true, checkout }, { status: 201 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ success: false, error: "Checkout failed" }, { status: 500 });
  }
}
