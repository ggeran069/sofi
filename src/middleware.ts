import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";

// Uses the DB-free config (no Credentials provider) so the middleware bundle
// stays free of Node/TCP dependencies and can run on Cloudflare Workers.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protected routes
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Protected API routes
  if (pathname.startsWith("/api/admin")) {
    if (!req.auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  // Exclude /api/auth — the middleware's auth() instance emits its own csrf
  // Set-Cookie on auth routes, duplicating the handler's and breaking the
  // CSRF check in the Workers runtime (MissingCSRF on login).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|og-image\\.png|api/auth).*)"],
};
