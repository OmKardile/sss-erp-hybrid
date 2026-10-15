import { NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/api/auth"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/robots") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authCookie = req.cookies.get("sss-erp-auth");
  const passkey = process.env.ERP_PASSKEY;

  // If no passkey configured, allow access (dev mode without auth)
  if (!passkey) {
    return NextResponse.next();
  }

  // Expected cookie value = base64 of the passkey
  const expectedValue = btoa(passkey);

  if (authCookie?.value === expectedValue) {
    return NextResponse.next();
  }

  // Not authenticated — redirect to login
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
