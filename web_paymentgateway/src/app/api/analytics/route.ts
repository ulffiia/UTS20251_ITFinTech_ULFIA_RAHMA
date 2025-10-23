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

    // Total transaksi
    const totalOrders = checkouts.length;

    // Total pendapatan (hanya payment sukses)
    const totalRevenue = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Produk terjual (total item di semua checkout)
    const totalProductsSold = checkouts.reduce(
      (sum, c) => sum + (c.items?.length || 0),
      0
    );

    // Grouping by tanggal (untuk grafik)
    const salesByDate: Record<string, number> = {};
    payments.forEach((p) => {
      if (p.status === "paid") {
        const date = new Date(p.createdAt).toLocaleDateString("id-ID");
        salesByDate[date] = (salesByDate[date] || 0) + p.amount;
      }
    });

    // Hitung jumlah status checkout
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
    console.error(err);
    return NextResponse.json({ error: "Gagal mengambil data analytics" }, { status: 500 });
  }
}
