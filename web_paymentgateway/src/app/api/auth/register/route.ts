// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { hash } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendWhatsapp } from "@/lib/fonnte";
import { OtpModel } from "@/lib/mongodb";

function normalizeIndoPhone(input: string) {
  let n = (input || "").replace(/\D/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  if (!n.startsWith("62")) n = "62" + n;
  return n;
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
}

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const name = String(fd.get("name") || "");
    const email = String(fd.get("email") || "").toLowerCase();
    const phoneRaw = String(fd.get("phone") || "");
    const password = String(fd.get("password") || "");

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const phone = phoneRaw ? normalizeIndoPhone(phoneRaw) : "";

    await connectDB();
    const exist = await User.findOne({ email });
    if (exist) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hash(password);
    await User.create({ name, email, phone, passwordHash });

    // Kirim OTP WA untuk verifikasi / login pertama
    if (phone) {
      const otp = generateOtp();
      // simpan OTP (collection terpisah, TTL 5 menit)
      await OtpModel.create({
  email,
  phone,
  code: otp,
  expiresAt: new Date(Date.now() + 5 * 60 * 1000),
});

      await sendWhatsapp(phone, `Kode OTP kamu: ${otp} (berlaku 5 menit)`);
    }

    // kembali ke halaman login
    return NextResponse.redirect(new URL("/login", req.url), { status: 302 });
  } catch (e) {
  const errorMessage = e instanceof Error ? e.message : "Server error";
  return NextResponse.json({ error: errorMessage }, { status: 500 });
}
}
