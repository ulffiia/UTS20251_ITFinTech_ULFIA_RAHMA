import { NextResponse } from "next/server";
import { connectDB, OtpModel } from "@/lib/mongodb";
import User from "@/models/User";
import { sendWhatsapp } from "@/lib/fonnte";
import jwt from "jsonwebtoken";
import { verifyHash } from "@/lib/auth"; // 👈 Import verifikasi password

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
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { phone: rawPhone, password } = body as {
      phone?: string;
      password?: string;
    };

    if (!rawPhone || !password) {
      return NextResponse.json(
        { error: "Phone dan password wajib diisi" },
        { status: 400 }
      );
    }

    const phone = normalizeIndoPhone(rawPhone);

    // Cek user
    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 👇 Verifikasi password lebih dulu
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Password belum diset" },
        { status: 400 }
      );
    }

    const isValid = await verifyHash(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Password salah" },
        { status: 401 }
      );
    }

    // Jika password valid, lanjut generate OTP
    const code = genOtp();
    const ttlMinutes = Number(process.env.OTP_TTL_MINUTES || 5);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    // Simpan OTP (hapus OTP lama untuk nomor yang sama agar rapi)
    await OtpModel.deleteMany({ phone });
    await OtpModel.create({
      phone,
      code,
      expiresAt,
      reason: "login",
      attempts: 0,
    });

    // Kirim OTP via WhatsApp
    const appName = process.env.APP_NAME || "Aplikasi";
    const msg =
      `Kode OTP ${appName} kamu: *${code}*\n` +
      `Berlaku hingga ${ttlMinutes} menit. ` +
      `Jangan bagikan kode ini ke siapa pun.`;
    await sendWhatsapp(phone, msg);

    // Buat temp token untuk tahap verifikasi OTP
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server misconfigured: JWT_SECRET missing" },
        { status: 500 }
      );
    }

    const tempToken = jwt.sign(
      {
        sub: String(user._id),
        phone,
        stage: "mfa",
        // Otorisasi sementara hanya untuk verifikasi OTP
      },
      secret,
      { expiresIn: `${ttlMinutes}m` }
    );

    return NextResponse.json({ mfaRequired: true, phone, tempToken });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Server error";
    console.error("Login error:", errorMessage);

    return NextResponse.json(
      { error: errorMessage || "Gagal memproses login" },
      { status: 500 }
    );
  }
}
