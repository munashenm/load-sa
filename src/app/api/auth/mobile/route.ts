import { NextResponse } from "next/server";
import {
  createSession,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { db } from "@/lib/db";

/** Driver mobile app: returns Bearer token */
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    include: { driverProfile: true },
  });

  if (!user || user.role !== "DRIVER") {
    return NextResponse.json({ error: "Driver account required" }, { status: 401 });
  }

  if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSession(user.id);

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      verificationStatus: user.driverProfile?.verificationStatus,
      driverProfileId: user.driverProfile?.id,
    },
  });
}
