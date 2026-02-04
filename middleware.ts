import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (Next.js internals)
  // - static files
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/bg", request.url));
  }
}
