import { NextResponse } from "next/server";
import { connectDB, OtpModel } from "@/lib/mongodb";
import User from "@/models/User"; // asumsi kamu sudah punya
import { sendWhatsapp } from "@/lib/fonnte";
import jwt from "jsonwebtoken";

function normalizeIndoPhone(input: string) {
  let n = (input || "").replace(/\D/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  if (!n.startsWith("62")) n = "62" + n;
  return n;
}
function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = normalizeIndoPhone(String(body.phone || ""));
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ phone });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // generate & simpan OTP (5 menit)
    const code = genOtp();
    await OtpModel.create({
      email: user.email,
      phone,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // kirim WA
    const template = process.env.FONNTE_OTP_TEMPLATE || "Kode OTP kamu {{OTP}} (berlaku 5 menit)";
    await sendWhatsapp(phone, template.replace("{{OTP}}", code));

    // temp token untuk langkah verify
    const tempToken = jwt.sign(
      { sub: String(user._id), phone, purpose: "mfa" },
      process.env.JWT_SECRET!,
      { expiresIn: "10m" }
    );

    return NextResponse.json({ mfaRequired: true, phone, tempToken });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
