import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import {
  canAcceptJobs,
  jobMatchesVehicle,
  primaryVehicleType,
} from "@/lib/driver-portal";
import { notifyCustomer } from "@/lib/notifications";
import type { VehicleType } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  const { id } = await params;

  if (!user?.driverProfile) {
    return NextResponse.json({ error: "Driver account required" }, { status: 403 });
  }

  const profile = await db.driverProfile.findUnique({
    where: { id: user.driverProfile.id },
    include: { vehicles: true },
  });
  if (!profile || !canAcceptJobs(profile)) {
    return NextResponse.json(
      { error: "Go online when verified to accept jobs" },
      { status: 403 },
    );
  }

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking || booking.status !== "SEARCHING_DRIVER") {
    return NextResponse.json({ error: "Job not available" }, { status: 404 });
  }

  const vType = primaryVehicleType(profile.vehicles);
  if (!jobMatchesVehicle(booking.vehicleType, vType)) {
    return NextResponse.json(
      { error: "Job does not match your vehicle type" },
      { status: 403 },
    );
  }

  const updated = await db.booking.update({
    where: { id },
    data: {
      driverId: user.driverProfile.id,
      status: "DRIVER_ASSIGNED",
    },
  });

  await notifyCustomer(
    booking.customerId,
    booking.id,
    booking.reference,
    "DRIVER_ACCEPTED",
  );

  return NextResponse.json({ booking: updated });
}
