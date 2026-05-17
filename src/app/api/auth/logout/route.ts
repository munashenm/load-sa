import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/app-url";
import {
  SESSION_COOKIE,
  applySessionClear,
  revokeSessionFromToken,
} from "@/lib/auth";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const legacyToken = cookieStore.get("zimload_session")?.value;

  await revokeSessionFromToken(token);
  await revokeSessionFromToken(legacyToken);

  const response = NextResponse.redirect(new URL("/", getRequestOrigin(request)));
  applySessionClear(response);
  return response;
}
