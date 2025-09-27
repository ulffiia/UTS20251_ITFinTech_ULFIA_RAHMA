import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";

export const runtime = "nodejs"; // biar stabil di Vercel

export async function POST(req: Request) {
  try {
    // 1. Verifikasi token dari Xendit
    const token = req.headers.get("x-callback-token");
    if (token !== process.env.XENDIT_WEBHOOK_TOKEN) {
      console.error("❌ Invalid Xendit token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body webhook
    const body = await req.json();
    console.error("🔥 Webhook received from Xendit:", JSON.stringify(body, null, 2));

    const status = body.status || body.data?.status;
    const externalId = body.external_id || body.data?.external_id;
    const invoiceId = body.id || body.data?.id;
    const paidAt = body.paid_at || body.data?.paid_at;

    // 3. Connect MongoDB
    await connectDB();

    // 4. Mapping status dari Xendit → status app
    let appStatus = "PENDING";
    if (status === "PAID" || status === "SETTLED") appStatus = "LUNAS";
    else if (status === "EXPIRED") appStatus = "EXPIRED";

    // 5. Update Payment (idempotent)
    if (externalId || invoiceId) {
      await Payment.findOneAndUpdate(
        { $or: [{ externalId }, { invoiceId }] },
        {
          $set: {
            status: appStatus,
            invoiceId,
            paidAt: paidAt ? new Date(paidAt) : undefined,
            updatedAt: new Date(),
            lastWebhookRaw: body,
          },
        },
        { new: true }
      );
    } else {
      console.error("⚠️ No externalId or invoiceId in webhook payload");
    }

    // 6. ACK cepat ke Xendit
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
