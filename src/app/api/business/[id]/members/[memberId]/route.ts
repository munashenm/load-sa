import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import {
  canManageBusiness,
  getBusinessAccessForUser,
} from "@/lib/business-portal";
import { db } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  const { id, memberId } = await params;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getBusinessAccessForUser(user.id, id);
  if (!access || !canManageBusiness(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const member = await db.businessMember.findFirst({
    where: { id: memberId, businessAccountId: id },
  });
  if (!member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (member.role === "OWNER") {
    return NextResponse.json({ error: "Cannot remove owner" }, { status: 400 });
  }

  await db.businessMember.delete({ where: { id: memberId } });
  return NextResponse.json({ ok: true });
}
