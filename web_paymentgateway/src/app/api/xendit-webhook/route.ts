// app/api/xendit/webhook/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";
import { sendWhatsapp } from "@/lib/fonnte";

export const runtime = "nodejs";

type XenditInvoicePayload = {
  id?: string;
  status?: string;
  paid_at?: string | null;
  external_id?: string;
  amount?: number;
  payer_email?: string | null;
  payment_method?: string;
  payment_channel?: string;
};

function normalizeStatus(xenditStatus?: string): string {
  const s = (xenditStatus || "").toUpperCase();
  if (s === "PAID" || s === "SETTLED") return "LUNAS";
  if (s === "EXPIRED") return "EXPIRED";
  return "PENDING";
}

function normalizeCheckoutStatus(paymentStatus: string): string {
  if (paymentStatus === "LUNAS") return "paid";
  if (paymentStatus === "EXPIRED") return "expired";
  return "pending";
}

async function notifyWhatsappPaid(checkout: any, payment: any) {
  const phone = checkout?.phone;

  if (!phone) {
    console.warn("ℹ️ Tidak ada nomor telepon untuk Checkout:", checkout?._id);
    return;
  }

  const orderCode = checkout?.code || "N/A";
  const total = checkout?.total?.toLocaleString("id-ID") || "0";
  const customerName = checkout?.customerName || "Customer";

  const message = `✅ *Pembayaran Berhasil!*

Halo ${customerName},

Pembayaran Anda telah kami konfirmasi.
━━━━━━━━━━━━━━━━━━
🧾 Kode Pesanan: *${orderCode}*
💰 Total: *Rp ${total}*
🕐 Waktu: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
💳 Metode: ${payment?.paymentMethod || "-"}
━━━━━━━━━━━━━━━━━━

Terima kasih telah berbelanja 🙏

Pesanan Anda akan segera diproses.`;

  try {
    await sendWhatsapp(phone, message);
    console.log("✅ WhatsApp terkirim ke:", phone);
  } catch (e) {
    console.error("⚠️ Gagal kirim WA:", e);
  }
}

export async function POST(req: Request) {
  try {
    // 1) Verifikasi token webhook Xendit
    const token = req.headers.get("x-callback-token");

    console.log("🔐 Webhook received");
    console.log("🔐 Token present:", !!token);

    if (!token || token !== process.env.XENDIT_WEBHOOK_TOKEN) {
      console.error("❌ Invalid or missing webhook token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse payload
    const raw = (await req.json()) as XenditInvoicePayload;

    console.log("📥 Webhook payload:", {
      id: raw.id,
      status: raw.status,
      external_id: raw.external_id,
      amount: raw.amount,
      payment_method: raw.payment_method,
    });

    const {
      id: invoiceId,
      status,
      external_id: externalId,
      paid_at: paidAt,
      amount,
      payment_method: paymentMethod,
      payment_channel: paymentChannel,
    } = raw;

    if (!externalId && !invoiceId) {
      console.error("⚠️ Webhook tanpa external_id atau id");
      return NextResponse.json({ ok: true });
    }

    const normalizedStatus = normalizeStatus(status);

    // 3) Connect DB
    await connectDB();

    // 4) Find Payment - cari by externalId ATAU invoiceId
    const payment = await Payment.findOne({
      $or: [
        ...(externalId ? [{ externalId }] : []),
        ...(invoiceId ? [{ invoiceId }] : []),
        ...(invoiceId ? [{ xenditInvoiceId: invoiceId }] : []),
      ],
    });

    if (!payment) {
      console.warn("ℹ️ Payment not found:", { externalId, invoiceId });
      // Tetap ACK agar Xendit tidak retry
      return NextResponse.json({ ok: true });
    }

    const previousStatus = payment.status || "PENDING";
    console.log("📊 Status transition:", previousStatus, "→", normalizedStatus);

    // 5) Update Payment (idempotent)
    payment.status = normalizedStatus;
    payment.invoiceId = invoiceId || payment.invoiceId;
    payment.xenditInvoiceId = invoiceId || payment.xenditInvoiceId;
    payment.amount = amount || payment.amount || payment.total;
    payment.total = amount || payment.total || payment.amount;
    payment.paidAt = paidAt ? new Date(paidAt) : payment.paidAt;
    payment.paymentMethod = paymentMethod || payment.paymentMethod;
    payment.paymentChannel = paymentChannel || payment.paymentChannel;
    payment.lastWebhookRaw = raw;

    await payment.save();

    console.log("✅ Payment updated:", payment._id);

    // 6) Update Checkout & Send WhatsApp
    if (payment.checkoutId) {
      const checkout = await Checkout.findById(payment.checkoutId);

      if (checkout) {
        const newCheckoutStatus = normalizeCheckoutStatus(normalizedStatus);

        // Update checkout status
        checkout.status = newCheckoutStatus;
        await checkout.save();

        console.log("✅ Checkout updated:", checkout.code, "→", checkout.status);

        // Send WhatsApp HANYA saat first-time paid (bukan re-webhook)
        const justPaid = previousStatus !== "LUNAS" && normalizedStatus === "LUNAS";

        if (justPaid) {
          console.log("📱 Sending WhatsApp notification...");
          await notifyWhatsappPaid(checkout, payment);
        } else {
          console.log("ℹ️ Skip WhatsApp notification (not first-time paid or already notified)");
        }
      } else {
        console.warn("ℹ️ Checkout not found:", payment.checkoutId);
      }
    } else {
      console.warn("ℹ️ Payment has no checkoutId");
    }

    // 7) ACK to Xendit
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    // Tetap return 200 agar Xendit tidak retry terus
    return NextResponse.json({ ok: true });
  }
}