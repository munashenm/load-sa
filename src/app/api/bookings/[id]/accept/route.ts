import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  const { id } = await params;

  if (!user?.driverProfile) {
    return NextResponse.json({ error: "Driver account required" }, { status: 403 });
  }

  if (user.driverProfile.verificationStatus !== "APPROVED") {
    return NextResponse.json(
      { error: "Complete driver verification before accepting jobs" },
      { status: 403 },
    );
  }

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking || booking.status !== "SEARCHING_DRIVER") {
    return NextResponse.json({ error: "Job not available" }, { status: 404 });
  }

  const updated = await db.booking.update({
    where: { id },
    data: {
      driverId: user.driverProfile.id,
      status: "DRIVER_ASSIGNED",
    },
  });

  return NextResponse.json({ booking: updated });
}
