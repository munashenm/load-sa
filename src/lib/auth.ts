import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import type { User } from "@prisma/client";
import type { UserRole } from "@/lib/types";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "loadsa_session";
const SESSION_DAYS = 14;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function sessionExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_DAYS);
  return d;
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await db.session.create({
    data: {
      token,
      userId,
      expiresAt: sessionExpiry(),
    },
  });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await db.session.deleteMany({ where: { token } });
}

export async function getSessionUser(): Promise<
  | (User & {
      driverProfile: {
        id: string;
        verificationStatus: string;
        isAvailable: boolean;
      } | null;
    })
  | null
> {
  const { getTokenFromRequest, getUserFromToken } = await import(
    "@/lib/auth-request"
  );
  const token = await getTokenFromRequest();
  return getUserFromToken(token);
}

function homeForRole(role: string): string {
  if (role === "DRIVER") return "/driver";
  if (role === "ADMIN") return "/admin";
  return "/book";
}

export async function requireUser(roles?: UserRole[], loginNext?: string) {
  const user = await getSessionUser();
  if (!user) {
    const next = loginNext ? `?next=${encodeURIComponent(loginNext)}` : "";
    redirect(`/login${next}`);
  }
  if (roles && !roles.includes(user.role as UserRole)) {
    redirect(homeForRole(user.role));
  }
  return user;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

const LEGACY_SESSION_COOKIE = "zimload_session";

export async function revokeSessionFromToken(token: string | undefined): Promise<void> {
  if (token) {
    await destroySession(token);
  }
}

/** Apply cleared session cookies on a NextResponse (required in Route Handlers). */
export function applySessionClear(response: {
  cookies: {
    set: (
      name: string,
      value: string,
      options?: { maxAge?: number; path?: string; httpOnly?: boolean },
    ) => void;
  };
}): void {
  for (const name of [SESSION_COOKIE, LEGACY_SESSION_COOKIE]) {
    response.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
    });
  }
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const legacyToken = cookieStore.get(LEGACY_SESSION_COOKIE)?.value;
  await revokeSessionFromToken(token);
  await revokeSessionFromToken(legacyToken);
  for (const name of [SESSION_COOKIE, LEGACY_SESSION_COOKIE]) {
    cookieStore.set(name, "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
}
