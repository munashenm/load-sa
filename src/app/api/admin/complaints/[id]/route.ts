import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";

const schema = z.object({
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const complaint = await db.complaint.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ complaint });
}
