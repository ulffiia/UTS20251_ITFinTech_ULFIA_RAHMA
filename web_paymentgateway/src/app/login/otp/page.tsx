"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function OtpPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") || "";
  const phone = sp.get("phone") || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("📤 Sending verify request...");
    console.log("Code:", code);
    console.log("Token:", token.slice(0, 20) + "...");

    try {
      const r = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, tempToken: token }),
      });

      console.log("Response status:", r.status);

      const data = await r.json();
      console.log("Response data:", data);

      if (!r.ok) {
        setError(data.error || "Verifikasi gagal");
        setLoading(false);
        return;
      }

      if (data.success) {
        console.log("✅ Verification successful, redirecting...");
        // Redirect ke homepage
        window.location.href = data.redirectTo || "/";
      }
    } catch (err: any) {
      console.error("💥 Error:", err);
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form 
        onSubmit={onVerify} 
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Masukkan Kode OTP
          </h1>
          <p className="text-sm text-gray-600">
            Kami sudah mengirim kode ke WhatsApp
          </p>
          <p className="text-sm font-semibold text-blue-600 mt-1">
            {phone}
          </p>
        </div>

        <div className="space-y-4">
          <input
            className="w-full border-2 border-gray-300 rounded-xl p-4 text-center text-2xl tracking-[0.5em] font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            disabled={loading}
            autoFocus
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
          </button>
        </div>

        <div className="text-center text-sm text-gray-500">
          Tidak menerima kode?{" "}
          <button 
            type="button"
            className="text-blue-600 hover:underline font-medium"
            onClick={() => router.back()}
          >
            Kirim ulang
          </button>
        </div>
      </form>
    </div>
  );
}