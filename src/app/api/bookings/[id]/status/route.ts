import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { notifyCustomerForStatus } from "@/lib/notifications";
import { applyOrderPricing } from "@/lib/platform";

const ALLOWED = [
  "DRIVER_ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
] as const;

export async function PATCH(
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

  const { status } = await request.json();
  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await db.booking.update({
    where: { id },
    data: { status },
  });

  await notifyCustomerForStatus(
    {
      id: booking.id,
      reference: booking.reference,
      customerId: booking.customerId,
      status,
    },
    booking.status,
  );

  if (status === "DELIVERED" && booking.paymentStatus === "PAID") {
    await applyOrderPricing(id, booking.finalPrice ?? booking.estimatedPrice);
  }

  return NextResponse.json({ booking: updated });
}
