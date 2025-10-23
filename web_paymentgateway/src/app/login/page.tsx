"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await r.json();
    setLoading(false);

    if (!r.ok) {
      alert(data.error || "Login error");
      return;
    }

    if (data.mfaRequired) {
      router.push(
        `/login/otp?token=${encodeURIComponent(data.tempToken)}&phone=${phone}`
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={onSubmit}
        className="bg-white shadow-md rounded-2xl p-8 w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Login via WhatsApp OTP
        </h1>
        <p className="text-sm text-gray-500 text-center">
          Masukkan nomor WhatsApp kamu untuk menerima kode OTP.
        </p>

        <input
          className="border rounded-lg w-full p-3 text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nomor WhatsApp (62…)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          disabled={loading}
        >
          {loading ? "Meminta OTP…" : "Kirim OTP"}
        </button>

        <div className="text-center text-sm text-gray-600 pt-4 border-t">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Daftar di sini
          </Link>
        </div>
      </form>
    </div>
  );
}
