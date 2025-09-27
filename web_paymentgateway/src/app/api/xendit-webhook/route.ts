import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.error("🔥 Webhook received from Xendit:", JSON.stringify(body, null, 2));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
