import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(req: NextRequest) {
  const token = req.cookies.get('sess')?.value;
  const protectedRe = [/^\/checkout/, /^\/payment/];
  const isProtected = protectedRe.some(re => re.test(req.nextUrl.pathname));
  if (isProtected && !token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ['/checkout/:path*', '/payment/:path*'] };
