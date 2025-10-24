import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const runtime = "nodejs"; // pastikan Node runtime

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    // ambil hash dari field yang ada
    const hash: string | undefined = user.passwordHash ?? user.password;
    if (!hash) {
      return NextResponse.json({ error: "Akun belum memiliki password" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(password, hash); // ✅ pakai bcrypt.compare
    if (!isValid) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    // (opsional) pastikan role admin jika memang harus admin saja
    // if (user.role !== "admin") {
    //   return NextResponse.json({ error: "Tidak memiliki akses admin" }, { status: 403 });
    // }

    const token = jwt.sign(
      { sub: String(user._id), email: user.email, role: user.role ?? "admin" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });

    res.cookies.set("sess", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
