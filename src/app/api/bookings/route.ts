import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { estimateBookingPrice, generateBookingReference } from "@/lib/pricing";
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
    const openJobs = await db.booking.findMany({
      where: { status: "SEARCHING_DRIVER" },
      orderBy: { createdAt: "desc" },
    });
    const myJobs = await db.booking.findMany({
      where: { driverId: user.driverProfile.id },
      orderBy: { createdAt: "desc" },
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
  const estimatedPrice = estimateBookingPrice(
    data.vehicleType,
    data.pickupProvince,
    data.dropoffProvince,
    data.weightKg,
    data.urgency,
    data.cargoSize,
  );

  const booking = await db.booking.create({
    data: {
      reference: generateBookingReference(),
      customerId: user.id,
      pickupAddress: data.pickupAddress,
      pickupCity: data.pickupCity,
      pickupProvince: data.pickupProvince,
      dropoffAddress: data.dropoffAddress,
      dropoffCity: data.dropoffCity,
      dropoffProvince: data.dropoffProvince,
      vehicleType: data.vehicleType,
      cargoDescription: data.cargoDescription,
      cargoSize: data.cargoSize,
      cargoDimensions: data.cargoDimensions || undefined,
      cargoImageUrl: data.cargoImageUrl || undefined,
      weightKg: data.weightKg,
      urgency: data.urgency,
      estimatedPrice,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
  });

  return NextResponse.json({ booking });
}
