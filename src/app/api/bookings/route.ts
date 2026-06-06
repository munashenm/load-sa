import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { estimateBookingPriceFromDb, generateBookingReference } from "@/lib/pricing";
import { bookingSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "CUSTOMER") {
    const bookings = await db.booking.findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        driver: {
          include: { user: { select: { fullName: true, phone: true } } },
        },
      },
    });
    return NextResponse.json({ bookings });
  }

  if (user.role === "DRIVER" && user.driverProfile) {
    const profile = await db.driverProfile.findUnique({
      where: { id: user.driverProfile.id },
      include: { vehicles: true },
    });
    if (!profile) {
      return NextResponse.json({ openJobs: [], myJobs: [] });
    }

    const { getAvailableJobsForDriver, primaryVehicleType } = await import(
      "@/lib/driver-portal"
    );
    const openJobs = await getAvailableJobsForDriver(
      profile.id,
      primaryVehicleType(profile.vehicles),
      profile,
    );
    const myJobs = await db.booking.findMany({
      where: {
        driverId: user.driverProfile.id,
        status: { notIn: ["DELIVERED", "CANCELLED"] },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ openJobs, myJobs });
  }

  return NextResponse.json({ bookings: [] });
}

export async function POST(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Customers only" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const { total, breakdown } = await estimateBookingPriceFromDb({
    vehicleType: data.vehicleType,
    pickupProvince: data.pickupProvince,
    dropoffProvince: data.dropoffProvince,
    weightKg: data.weightKg,
    urgency: data.urgency,
    cargoSize: data.cargoSize,
    deliveryCategory: data.deliveryCategory,
    isFragile: data.isFragile ?? data.deliveryCategory === "FRAGILE",
    usesTollRoads: data.usesTollRoads,
    isNightDelivery: data.isNightDelivery,
    insuranceLevel: data.insuranceLevel,
    stops: data.stops,
    scheduledAt: data.scheduledAt,
  });

  const booking = await db.booking.create({
    data: {
      reference: generateBookingReference(),
      customerId: user.id,
      pickupAddress: data.pickupAddress,
      pickupCity: data.pickupCity,
      pickupProvince: data.pickupProvince,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      dropoffAddress: data.dropoffAddress,
      dropoffCity: data.dropoffCity,
      dropoffProvince: data.dropoffProvince,
      dropoffLat: data.dropoffLat,
      dropoffLng: data.dropoffLng,
      vehicleType: data.vehicleType,
      cargoDescription: data.cargoDescription,
      cargoSize: data.cargoSize,
      cargoDimensions: data.cargoDimensions || undefined,
      cargoImageUrl: data.cargoImageUrl || undefined,
      weightKg: data.weightKg,
      urgency: data.urgency,
      deliveryCategory: data.deliveryCategory,
      isFragile: data.isFragile ?? data.deliveryCategory === "FRAGILE",
      usesTollRoads: data.usesTollRoads ?? false,
      isNightDelivery: data.isNightDelivery ?? false,
      insuranceLevel: data.insuranceLevel,
      stopsJson: data.stops?.length ? JSON.stringify(data.stops) : undefined,
      priceBreakdownJson: JSON.stringify(breakdown),
      estimatedPrice: total,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
  });

  const { sendBookingConfirmation } = await import("@/lib/messaging");
  await sendBookingConfirmation(user.id, booking.reference, booking.id);

  return NextResponse.json({ booking, breakdown });
}
