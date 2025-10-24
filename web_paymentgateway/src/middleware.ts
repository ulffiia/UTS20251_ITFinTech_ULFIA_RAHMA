import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const sess = req.cookies.get("sess"); // ✅ ambil langsung dari request

  const url = req.nextUrl.clone();

  // Redirect ke /login kalau belum login dan akses halaman admin
  if (!sess && url.pathname.startsWith("/admin")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Kalau sudah login dan akses login page, redirect ke dashboard
  if (sess && url.pathname === "/login") {
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"], // halaman yang dicegat middleware
};
