import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createSession,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { normalizePhone } from "@/lib/sa-data";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, password, fullName, phone, role } = parsed.data;
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: { email: ["An account with this email already exists"] } },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone: normalizePhone(phone),
        role,
        ...(role === "DRIVER"
          ? { driverProfile: { create: {} } }
          : {}),
      },
    });

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not create account" },
      { status: 500 },
    );
  }
}
