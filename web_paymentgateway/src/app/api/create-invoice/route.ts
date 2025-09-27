import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, externalId } = body;

    const res = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(process.env.XENDIT_SECRET_KEY + ":").toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: externalId,
        amount,
        success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`,
      }),
    });

    const invoice = await res.json();
    return NextResponse.json(invoice);
  } catch (err) {
    console.error("Error creating invoice:", err);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
