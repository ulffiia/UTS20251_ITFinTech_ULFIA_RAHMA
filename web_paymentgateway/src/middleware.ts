import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const sess = req.cookies.get("sess");
  const url = req.nextUrl.clone();

  // Jika user belum punya sesi dan mencoba akses halaman admin → arahkan ke halaman login admin
  if (!sess && url.pathname.startsWith("/admin")) {
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Jika sudah login dan mencoba masuk ke /admin/login lagi, langsung diarahkan ke dashboard admin
  if (sess && url.pathname === "/admin/login") {
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Selain itu, biarkan saja lewat
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // hanya berlaku untuk route admin
};
