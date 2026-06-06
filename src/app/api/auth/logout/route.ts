import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/app-url";
import {
  SESSION_COOKIE,
  LEGACY_SESSION_COOKIES,
  applySessionClear,
  revokeSessionFromToken,
} from "@/lib/auth";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const tokens = [SESSION_COOKIE, ...LEGACY_SESSION_COOKIES].map(
    (name) => cookieStore.get(name)?.value,
  );
  for (const token of tokens) {
    await revokeSessionFromToken(token);
  }

  const response = NextResponse.redirect(new URL("/", getRequestOrigin(request)));
  applySessionClear(response);
  return response;
}
