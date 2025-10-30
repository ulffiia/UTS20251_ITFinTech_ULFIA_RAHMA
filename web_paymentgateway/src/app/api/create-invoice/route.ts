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
    console.log("🚀 [CREATE-INVOICE] Starting...");

    // Check environment variables
    console.log("🔑 [ENV-CHECK] XENDIT_SECRET_KEY exists:", !!process.env.XENDIT_SECRET_KEY);
    console.log("🔑 [ENV-CHECK] XENDIT_SECRET_KEY length:", process.env.XENDIT_SECRET_KEY?.length || 0);
    console.log("🔑 [ENV-CHECK] NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL);

    if (!process.env.XENDIT_SECRET_KEY) {
      console.error("❌ [ENV-CHECK] XENDIT_SECRET_KEY is missing!");
      return NextResponse.json(
        { error: "Konfigurasi server tidak lengkap (XENDIT_SECRET_KEY)" },
        { status: 500 }
      );
    }

    await connectDB();

    const body: RequestBody = await req.json();
    console.log("📦 [REQUEST-BODY]:", JSON.stringify(body, null, 2));

    const {
      customerName,
      email,
      phone,
      items,
      subtotal,
      tax = 0,
      discount = 0,
      notes,
      userId,
    } = body;

    // Validasi input
    if (!customerName || !phone || !items || items.length === 0) {
      console.error("❌ [VALIDATION] Missing required fields");
      return NextResponse.json(
        { error: "Data tidak lengkap. Pastikan nama, nomor HP, dan items terisi." },
        { status: 400 }
      );
    }

    // Calculate total
    const total = subtotal + tax - discount;

    if (total <= 0) {
      console.error("❌ [VALIDATION] Total must be greater than 0");
      return NextResponse.json(
        { error: "Total pembayaran harus lebih dari 0" },
        { status: 400 }
      );
    }

    // Generate unique code
    const code = generateCheckoutCode();
    console.log("📝 [CHECKOUT] Generated code:", code);

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

    console.log("✅ [CHECKOUT] Created:", checkout._id);

    // 2) Create Xendit Invoice via API
    try {
      const secretKey = process.env.XENDIT_SECRET_KEY;
      
      // Xendit menggunakan Basic Auth dengan format: "SECRET_KEY:"
      const xenditAuth = Buffer.from(`${secretKey}:`).toString("base64");

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

      console.log("📤 [XENDIT] Payload:", JSON.stringify(invoicePayload, null, 2));
      console.log("📤 [XENDIT] Auth header (first 20 chars):", xenditAuth.substring(0, 20) + "...");

      const xenditResponse = await fetch("https://api.xendit.co/v2/invoices", {
        method: "POST",
        headers: {
          Authorization: `Basic ${xenditAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoicePayload),
      });

      console.log("📥 [XENDIT] Response status:", xenditResponse.status);

      if (!xenditResponse.ok) {
        const errorText = await xenditResponse.text();
        console.error("❌ [XENDIT] Error response:", errorText);
        
        // Parse error jika format JSON
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error_code || errorText;
          console.error("❌ [XENDIT] Parsed error:", errorJson);
        } catch {
          // Jika bukan JSON, pakai text as-is
        }

        throw new Error(`Xendit API error (${xenditResponse.status}): ${errorMessage}`);
      }

      const invoice = await xenditResponse.json();
      console.log("✅ [XENDIT] Invoice created:", invoice.id);
      console.log("🔗 [XENDIT] Invoice URL:", invoice.invoice_url);

      // 3) Create Payment Document
      const payment = await Payment.create({
        xenditInvoiceId: invoice.id,
        invoiceId: invoice.id,
        externalId: code,
        xenditInvoiceUrl: invoice.invoice_url,
        invoiceUrl: invoice.invoice_url,
        checkoutId: checkout._id,
        total: total,
        amount: total,
        status: "PENDING",
        expiresAt: invoice.expiry_date ? new Date(invoice.expiry_date) : undefined,
        items: items,
        userId: userId || undefined,
      });

      console.log("✅ [PAYMENT] Created:", payment._id);

      // 4) Update checkout dengan paymentId
      checkout.paymentId = payment._id;
      await checkout.save();

      console.log("✅ [CHECKOUT] Updated with paymentId");

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
      console.error("💥 [XENDIT] Fatal error:", err.message);
      console.error("💥 [XENDIT] Stack:", err.stack);

      // Rollback: hapus checkout jika invoice gagal dibuat
      await Checkout.findByIdAndDelete(checkout._id);
      console.log("🔄 [ROLLBACK] Checkout deleted");

      return NextResponse.json(
        {
          error: "Gagal membuat invoice pembayaran",
          details: err.message,
          code: "XENDIT_ERROR",
        },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    const err = error as Error;
    console.error("💥 [FATAL] Create invoice error:", err.message);
    console.error("💥 [FATAL] Stack:", err.stack);
    
    return NextResponse.json(
      { 
        error: err.message || "Gagal memproses checkout",
        code: "SERVER_ERROR"
      },
      { status: 500 }
    );
  }
}