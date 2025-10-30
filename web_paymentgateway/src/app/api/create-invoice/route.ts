// app/api/checkout/create-invoice/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Checkout from "@/models/Checkout";
import Payment from "@/models/Payment";

// Define interface for item
interface Item {
  name: string;
  quantity: number;
  price: number;
}

// Define interface for request body
interface RequestBody {
  customerName: string;
  email?: string;
  phone: string;
  items: Item[];
  subtotal: number;
  tax?: number;
  discount?: number;
  notes?: string;
  userId?: string;
}

// Generate unique checkout code
function generateCheckoutCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CHK-${timestamp}-${random}`;
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body: RequestBody = await req.json();
    const {
      customerName,
      email,
      phone,
      items,
      subtotal,
      tax = 0,
      discount = 0,
      notes,
      userId, // opsional
    } = body;

    // Validasi input
    if (!customerName || !phone || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Data tidak lengkap. Pastikan nama, nomor HP, dan items terisi." },
        { status: 400 }
      );
    }

    // Calculate total
    const total = subtotal + tax - discount;

    if (total <= 0) {
      return NextResponse.json(
        { error: "Total pembayaran harus lebih dari 0" },
        { status: 400 }
      );
    }

    // Generate unique code
    const code = generateCheckoutCode();

    console.log("📝 Creating checkout:", code);

    // 1) Create Checkout Document
    const checkout = await Checkout.create({
      code,
      customerName,
      email,
      phone,
      items,
      subtotal,
      tax,
      discount,
      total,
      status: "pending",
      notes,
      userId: userId || undefined,
    });

    console.log("✅ Checkout created:", checkout._id);

    // 2) Create Xendit Invoice via API
    try {
      const xenditAuth = Buffer.from(
        `${process.env.XENDIT_SECRET_KEY}:`
      ).toString("base64");

      const invoicePayload = {
        external_id: code,
        amount: total,
        description: `Pembayaran untuk pesanan ${code}`,
        payer_email: email || undefined,
        currency: "IDR",
        reminder_time: 1,
        invoice_duration: 86400, // 24 jam
        success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?code=${code}`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed?code=${code}`,
        items: items.map((item: Item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        customer: email
          ? {
              given_names: customerName,
              email: email,
              mobile_number: phone,
            }
          : undefined,
      };

      console.log("📤 Sending request to Xendit...");

      const xenditResponse = await fetch("https://api.xendit.co/v2/invoices", {
        method: "POST",
        headers: {
          Authorization: `Basic ${xenditAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoicePayload),
      });

      if (!xenditResponse.ok) {
        const errorText = await xenditResponse.text();
        console.error("❌ Xendit error:", xenditResponse.status, errorText);
        throw new Error(`Xendit API error: ${xenditResponse.status}`);
      }

      const invoice = await xenditResponse.json();

      console.log("✅ Xendit invoice created:", invoice.id);

      // 3) Create Payment Document
      const payment = await Payment.create({
        xenditInvoiceId: invoice.id,
        invoiceId: invoice.id, // alias
        externalId: code,
        xenditInvoiceUrl: invoice.invoice_url,
        invoiceUrl: invoice.invoice_url, // alias
        checkoutId: checkout._id,
        total: total,
        amount: total, // alias
        status: "PENDING",
        expiresAt: invoice.expiry_date ? new Date(invoice.expiry_date) : undefined,
        items: items, // simpan juga di payment untuk referensi
        userId: userId || undefined,
      });

      console.log("✅ Payment created:", payment._id);

      // 4) Update checkout dengan paymentId
      checkout.paymentId = payment._id;
      await checkout.save();

      // 5) Return response dengan invoice URL
      return NextResponse.json({
        success: true,
        checkoutCode: code,
        checkoutId: checkout._id,
        invoiceUrl: invoice.invoice_url,
        invoiceId: invoice.id,
        expiresAt: invoice.expiry_date,
        amount: total,
      });
    } catch (xenditError: unknown) {
      const err = xenditError as Error;
      console.error("❌ Xendit error:", err);

      // Rollback: hapus checkout jika invoice gagal dibuat
      await Checkout.findByIdAndDelete(checkout._id);

      return NextResponse.json(
        {
          error: "Gagal membuat invoice pembayaran",
          details: err.message,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Create invoice error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memproses checkout" },
      { status: 500 }
    );
  }
}