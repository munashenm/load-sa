import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

/** MVP admin endpoint — approve/reject drivers. Use ADMIN role user in seed. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { id } = await params;
  const { action, reviewNotes } = await request.json();

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const profile = await db.driverProfile.update({
    where: { id },
    data: {
      verificationStatus: action === "approve" ? "APPROVED" : "REJECTED",
      reviewedAt: new Date(),
      reviewNotes: reviewNotes ?? null,
    },
  });

  return NextResponse.json({ profile });
}
