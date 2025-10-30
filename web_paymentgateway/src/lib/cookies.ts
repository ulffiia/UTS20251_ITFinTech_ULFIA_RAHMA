import { cookies } from "next/headers";

export const SESSION_COOKIE = "sess";

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  // ✅ Deteksi environment
  const isProduction = process.env.NODE_ENV === "production";
  
  // ✅ Di local: secure=false (HTTP ok)
  // ✅ Di production: secure=true (HTTPS only)
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction, // ✅ Dynamic based on environment
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  console.log("✅ [COOKIE] Session cookie set:", {
    environment: isProduction ? "production" : "development",
    secure: isProduction,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  
  cookieStore.delete(SESSION_COOKIE);
  
  console.log("🗑️ [COOKIE] Session cookie cleared");
}