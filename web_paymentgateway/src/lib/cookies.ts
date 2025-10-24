import { cookies } from "next/headers";

export const SESSION_COOKIE = "sess";

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies(); // ✅ harus pakai await

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
}
