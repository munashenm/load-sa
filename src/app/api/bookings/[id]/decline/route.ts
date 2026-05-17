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
    return NextResponse.json({ error: "Driver only" }, { status: 403 });
  }

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking || booking.status !== "SEARCHING_DRIVER") {
    return NextResponse.json({ error: "Job not available" }, { status: 404 });
  }

  await db.bookingDecline.upsert({
    where: {
      driverProfileId_bookingId: {
        driverProfileId: user.driverProfile.id,
        bookingId: id,
      },
    },
    create: {
      driverProfileId: user.driverProfile.id,
      bookingId: id,
    },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
