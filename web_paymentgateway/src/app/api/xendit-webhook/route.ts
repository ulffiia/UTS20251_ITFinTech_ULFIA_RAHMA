// app/api/xendit/webhook/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";
import { sendWhatsapp } from "@/lib/fonnte";

export const runtime = "nodejs";

/** ---- Minimal shape dari payload Xendit (invoice) ---- */
type XenditInvoicePayload = {
  id?: string;
  status?: string;            // "PAID" | "SETTLED" | "EXPIRED" | "PENDING" | ...
  paid_at?: string | null;
  external_id?: string;
  amount?: number;
  payer_email?: string | null;
  data?: {
    id?: string;
    status?: string;
    paid_at?: string | null;
    external_id?: string;
    amount?: number;
  };
};

type AppStatus = "PENDING" | "LUNAS" | "EXPIRED";

/** Map status Xendit → status internal */
function mapStatus(xenditStatus?: string): AppStatus {
  const s = (xenditStatus || "").toUpperCase();
  if (s === "PAID" || s === "SETTLED") return "LUNAS";
  if (s === "EXPIRED") return "EXPIRED";
  return "PENDING";
}

/** Ambil field dari root maupun data */
function pickFromPayload(body: XenditInvoicePayload) {
  const status = body.status ?? body.data?.status;
  const externalId = body.external_id ?? body.data?.external_id;
  const invoiceId = body.id ?? body.data?.id;
  const paidAt = body.paid_at ?? body.data?.paid_at;
  const amount = body.amount ?? body.data?.amount;
  return { status, externalId, invoiceId, paidAt, amount };
}

/** Minimal tipe untuk Checkout yang kita butuhkan di notifikasi */
type CheckoutLike = {
  _id?: unknown;
  phone?: string;
  userPhone?: string;
  code?: string;
  total?: number;
  amount?: number;
  customerName?: string;
};

/** Kirim WA yang lebih informatif */
async function notifyWhatsappPaid(checkout: CheckoutLike, amount?: number) {
  const phone =
    checkout?.phone ||
    checkout?.userPhone ||
    null;

  if (!phone) {
    console.warn("ℹ️ Tidak ada nomor telepon untuk Checkout:", checkout?._id);
    return;
  }

  const orderCode =
    checkout?.code || String(checkout?._id || "").slice(-6).toUpperCase();

  const total = (() => {
    const a =
      typeof checkout?.total === "number"
        ? checkout.total
        : typeof checkout?.amount === "number"
        ? checkout.amount
        : typeof amount === "number"
        ? amount
        : undefined;
    return typeof a === "number" ? a.toLocaleString("id-ID") : "-";
  })();

  const message = `✅ *Pembayaran Berhasil!*

Halo ${checkout?.customerName || "Customer"},

Pembayaran Anda telah kami konfirmasi.
━━━━━━━━━━━━━━━━━━
🧾 Kode Pesanan: ${orderCode}
💰 Total: Rp ${total}
🕒 Waktu: ${new Date().toLocaleString("id-ID")}
━━━━━━━━━━━━━━━━━━

Terima kasih telah berbelanja 🙏`;

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
    if (!token || token !== process.env.XENDIT_WEBHOOK_TOKEN) {
      console.error("❌ Invalid Xendit token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse payload
    const raw = (await req.json()) as XenditInvoicePayload;
    const { status, externalId, invoiceId, paidAt, amount } = pickFromPayload(raw);

    if (!externalId && !invoiceId) {
      console.error("⚠️ Webhook tanpa external_id/id. Payload:", raw);
      // Tetap ACK agar Xendit tidak retry berulang
      return NextResponse.json({ ok: true });
    }

    const appStatus = mapStatus(status);

    // 3) Koneksi DB
    await connectDB();

    // 4) Ambil Payment dulu untuk idempotency (cek status sebelumnya)
    const orFilters: Array<{ externalId: string } | { invoiceId: string }> = [];
    if (externalId) orFilters.push({ externalId });
    if (invoiceId) orFilters.push({ invoiceId });

    const paymentFilter: { $or: Array<{ externalId: string } | { invoiceId: string }> } = {
      $or: orFilters,
    };

    const existing = await Payment.findOne(paymentFilter);

    if (!existing) {
      console.warn("ℹ️ Payment belum ditemukan:", { externalId, invoiceId });
      // Tetap ACK; bisa reconcile via job/cron
      return NextResponse.json({ ok: true });
    }

    const previousStatus: AppStatus = (existing.status as AppStatus) || "PENDING";

    // 5) Update Payment (idempotent)
    await Payment.updateOne(paymentFilter, {
      $set: {
        status: appStatus,
        invoiceId: invoiceId ?? existing.invoiceId, // jangan null-kan kalau webhook tidak bawa
        amount: typeof amount === "number" ? amount : existing.amount,
        paidAt: paidAt ? new Date(paidAt) : existing.paidAt,
        updatedAt: new Date(),
        lastWebhookRaw: raw,
      },
    });

    // 6) (Opsional) Sinkronkan status Checkout + kirim WA saat transisi ke LUNAS
    if (existing.checkoutId) {
      const checkoutDoc = await Checkout.findById(existing.checkoutId);

      if (checkoutDoc) {
        // Update status checkout berdasarkan status app
        if (appStatus === "LUNAS") checkoutDoc.status = "paid";
        else if (appStatus === "EXPIRED") checkoutDoc.status = "expired";
        else checkoutDoc.status = "pending";

        await checkoutDoc.save();

        // Hanya kirim WA jika barusan berubah menjadi LUNAS (bukan re-webhook)
        const justPaid = previousStatus !== "LUNAS" && appStatus === "LUNAS";
        if (justPaid) {
          await notifyWhatsappPaid(
            {
              _id: checkoutDoc._id,
              phone: checkoutDoc.phone,
              userPhone: (checkoutDoc as unknown as { userPhone?: string })?.userPhone,
              code: checkoutDoc.code,
              total: checkoutDoc.total,
              amount: checkoutDoc.amount,
              customerName: checkoutDoc.customerName,
            },
            amount
          );
        }
      } else {
        console.warn("ℹ️ Checkout tidak ditemukan:", existing.checkoutId);
      }
    }

    // 7) ACK cepat ke Xendit
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    // Umumnya tetap 200 agar Xendit tidak banjir retry jika error non-fatal.
    // Jika ingin Xendit retry, balas 500.
    return NextResponse.json({ ok: true });
  }
}
