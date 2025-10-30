import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Checkout from "@/models/Checkout";
import Payment from "@/models/Payment";

export async function GET() {
  try {
    await connectDB();

    // Ambil semua checkout dan payment
    const checkouts = await Checkout.find();
    const payments = await Payment.find();

    // Total transaksi (dari Checkout)
    const totalOrders = checkouts.length;

    // ✅ FIX: Gunakan field `total` dan status UPPERCASE
    const totalRevenue = payments
      .filter((p) => p.status === "PAID" || p.status === "LUNAS")
      .reduce((sum, p) => sum + (p.total || p.amount || 0), 0);

    // Produk terjual (total item di semua checkout)
    const totalProductsSold = checkouts.reduce(
      (sum, c) => sum + (c.items?.length || 0),
      0
    );

    // ✅ FIX: Grouping by tanggal dengan status yang benar
    const salesByDate: Record<string, number> = {};
    payments.forEach((p) => {
      if (p.status === "PAID" || p.status === "LUNAS") {
        const date = new Date(p.createdAt).toLocaleDateString("id-ID");
        const amount = p.total || p.amount || 0;
        salesByDate[date] = (salesByDate[date] || 0) + amount;
      }
    });

    // ✅ FIX: Hitung status dari Checkout (bukan Payment)
    const statusCount = checkouts.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProductsSold,
      salesByDate,
      statusCount,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data analytics" },
      { status: 500 }
    );
  }
}