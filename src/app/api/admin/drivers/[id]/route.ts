import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  action: z.enum(["approve", "reject", "suspend", "activate"]),
  reviewNotes: z.string().optional(),
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
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { action, reviewNotes } = parsed.data;
  const update: {
    verificationStatus?: string;
    accountStatus?: string;
    reviewedAt?: Date;
    reviewNotes?: string | null;
    isAvailable?: boolean;
  } = { reviewedAt: new Date() };

  switch (action) {
    case "approve":
      update.verificationStatus = "APPROVED";
      update.accountStatus = "ACTIVE";
      break;
    case "reject":
      update.verificationStatus = "REJECTED";
      update.reviewNotes = reviewNotes ?? null;
      break;
    case "suspend":
      update.accountStatus = "SUSPENDED";
      update.isAvailable = false;
      break;
    case "activate":
      update.accountStatus = "ACTIVE";
      break;
  }

  const profile = await db.driverProfile.update({
    where: { id },
    data: update,
  });

  return NextResponse.json({ profile });
}
