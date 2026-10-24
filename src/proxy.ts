import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth/server";

const AUTH_COOKIE_PREFIX = "__Secure-neon-auth";

const authMiddleware = auth.middleware({ loginUrl: "/sign-in" });

const protectedPrefixes = ["/dashboard", "/onboarding", "/admin"];

function isProtected(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isRedirect(response: Response) {
  return response.status >= 300 && response.status < 400;
}

function withoutAuthCookies(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  const kept = request.cookies.getAll().filter((cookie) => !cookie.name.startsWith(AUTH_COOKIE_PREFIX));
  headers.set("cookie", kept.map((cookie) => `${cookie.name}=${encodeURIComponent(cookie.value)}`).join("; "));
  return headers;
}

export default async function proxy(request: NextRequest) {
  const response = await authMiddleware(request);

  if (isProtected(request.nextUrl.pathname) || !isRedirect(response)) {
    return response;
  }

  const signedOut = NextResponse.next({ request: { headers: withoutAuthCookies(request) } });
  for (const cookie of response.headers.getSetCookie()) {
    signedOut.headers.append("Set-Cookie", cookie);
  }
  return signedOut;
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/admin/:path*", "/invite/:path*", "/sign-up"],
};
