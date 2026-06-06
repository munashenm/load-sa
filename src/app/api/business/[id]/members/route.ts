import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import {
  canManageBusiness,
  getBusinessAccessForUser,
} from "@/lib/business-portal";
import { db } from "@/lib/db";
import { businessInviteSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  const { id } = await params;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getBusinessAccessForUser(user.id, id);
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = await db.businessMember.findMany({
    where: { businessAccountId: id },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ members });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  const { id } = await params;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getBusinessAccessForUser(user.id, id);
  if (!access || !canManageBusiness(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = businessInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await db.user.findUnique({ where: { email } });

  const existingMember = await db.businessMember.findFirst({
    where: {
      businessAccountId: id,
      OR: [
        { invitedEmail: email },
        ...(existingUser ? [{ userId: existingUser.id }] : []),
      ],
    },
  });
  if (existingMember) {
    return NextResponse.json({ error: "User already on team" }, { status: 409 });
  }

  const member = await db.businessMember.create({
    data: {
      businessAccountId: id,
      userId: existingUser?.id,
      invitedEmail: existingUser ? undefined : email,
      role: parsed.data.role,
      status: existingUser ? "ACTIVE" : "INVITED",
    },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
  });

  return NextResponse.json({ member });
}
