import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { notifyCustomer } from "@/lib/notifications";
import { resolveCityCoords } from "@/lib/sa-data";

function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

  const { lat, lng } = await request.json();
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const drop = resolveCityCoords(booking.dropoffCity, booking.dropoffProvince);
  const km = distanceKm(lat, lng, drop.lat, drop.lng);

  const updated = await db.booking.update({
    where: { id },
    data: {
      driverLat: lat,
      driverLng: lng,
      lastLocationAt: new Date(),
      status:
        booking.status === "DRIVER_ASSIGNED" ? "IN_TRANSIT" : booking.status,
    },
  });

  if (km < 25 && booking.status !== "DELIVERED") {
    const recent = await db.notification.findFirst({
      where: {
        bookingId: id,
        type: "NEAR_DESTINATION",
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (!recent) {
      await notifyCustomer(
        booking.customerId,
        booking.id,
        booking.reference,
        "NEAR_DESTINATION",
      );
    }
  }

  return NextResponse.json({ booking: updated });
}
