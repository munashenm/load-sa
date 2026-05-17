import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { notifyCustomer } from "@/lib/notifications";

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
  if (!booking || booking.driverId !== user.driverProfile.id) {
    return NextResponse.json({ error: "Not your job" }, { status: 403 });
  }

  await notifyCustomer(
    booking.customerId,
    booking.id,
    booking.reference,
    "EN_ROUTE_PICKUP",
  );

  return NextResponse.json({ ok: true });
}
