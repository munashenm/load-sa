import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { SESSION_COOKIE, LEGACY_SESSION_COOKIES } from "@/lib/auth";

export async function getTokenFromRequest(
  request?: Request,
): Promise<string | undefined> {
  if (request) {
    const auth = request.headers.get("authorization");
    if (auth?.toLowerCase().startsWith("bearer ")) {
      return auth.slice(7).trim();
    }
  }
  const cookieStore = await cookies();
  const primary = cookieStore.get(SESSION_COOKIE)?.value;
  if (primary) return primary;
  for (const name of LEGACY_SESSION_COOKIES) {
    const legacy = cookieStore.get(name)?.value;
    if (legacy) return legacy;
  }
  return undefined;
}

export async function getUserFromToken(
  token: string | undefined,
): Promise<
  | (User & {
      driverProfile: {
        id: string;
        verificationStatus: string;
        isAvailable: boolean;
      } | null;
    })
  | null
> {
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          driverProfile: {
            select: { id: true, verificationStatus: true, isAvailable: true },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}

export async function getSessionUserFromRequest(
  request?: Request,
): Promise<
  | (User & {
      driverProfile: {
        id: string;
        verificationStatus: string;
        isAvailable: boolean;
      } | null;
    })
  | null
> {
  const token = await getTokenFromRequest(request);
  return getUserFromToken(token);
}
