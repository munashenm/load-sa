import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { generateBookingReference } from "@/lib/pricing";
import { calculateShuttlePrice } from "@/lib/shuttle-pricing";
import { shuttleClassToVehicleType } from "@/lib/shuttle-data";
import { shuttleBookingSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Customers only" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = shuttleBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const breakdown = calculateShuttlePrice({
    shuttleTripType: data.shuttleTripType,
    shuttleVehicleClass: data.shuttleVehicleClass,
    pickupCity: data.pickupCity,
    pickupProvince: data.pickupProvince,
    dropoffCity: data.dropoffCity,
    dropoffProvince: data.dropoffProvince,
    airportCode: data.airportCode,
    passengerCount: data.passengerCount,
    luggagePieces: data.luggagePieces,
    hireHours: data.hireHours,
    urgency: data.urgency,
    isNightDelivery: data.isNightDelivery,
  });

  const vehicleType = shuttleClassToVehicleType(data.shuttleVehicleClass);
  const tripLabel = data.shuttleTripType.replace(/_/g, " ").toLowerCase();

  const booking = await db.booking.create({
    data: {
      reference: generateBookingReference(),
      customerId: user.id,
      serviceType: "SHUTTLE",
      pickupAddress: data.pickupAddress,
      pickupCity: data.pickupCity,
      pickupProvince: data.pickupProvince,
      dropoffAddress: data.dropoffAddress,
      dropoffCity: data.dropoffCity,
      dropoffProvince: data.dropoffProvince,
      vehicleType,
      cargoDescription: `Shuttle: ${tripLabel} · ${data.passengerCount} passenger(s)`,
      shuttleTripType: data.shuttleTripType,
      shuttleVehicleClass: data.shuttleVehicleClass,
      airportCode: data.airportCode,
      flightNumber: data.flightNumber,
      passengerCount: data.passengerCount,
      luggagePieces: data.luggagePieces,
      hireHours: data.hireHours,
      passengerNotes: data.passengerNotes,
      urgency: data.urgency,
      isNightDelivery: data.isNightDelivery ?? false,
      estimatedPrice: breakdown.total,
      priceBreakdownJson: JSON.stringify(breakdown),
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
  });

  return NextResponse.json({ booking, breakdown });
}
