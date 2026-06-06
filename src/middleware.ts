import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Keep auth cookies on one host (avoids logout after Paystack redirect). */
export function middleware(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl || process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  let canonicalHost: string;
  try {
    canonicalHost = new URL(appUrl).host;
  } catch {
    return NextResponse.next();
  }

  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
    ?? request.headers.get("host");

  if (host && host !== canonicalHost) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = canonicalHost;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
