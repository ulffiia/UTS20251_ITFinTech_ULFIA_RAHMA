// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const sess = req.cookies.get("sess")?.value;
  if (!sess) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// ✅ Proteksi hanya route sensitif
export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/api/checkout/:path*",
  ],
};
