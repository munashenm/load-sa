import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createSession,
  applySessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
      include: { driverProfile: true },
    });

    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createSession(user.id);

    const { activatePendingBusinessInvites } = await import("@/lib/business-portal");
    await activatePendingBusinessInvites(user.id, user.email);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        verificationStatus: user.driverProfile?.verificationStatus,
      },
    });
    return applySessionCookie(response, token);
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
