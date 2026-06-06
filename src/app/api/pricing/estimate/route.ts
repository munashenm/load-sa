import { NextResponse } from "next/server";
import { estimateDeliveryTimes } from "@/lib/delivery-estimates";
import { estimateBookingPriceFromDb } from "@/lib/pricing";
import { calculateShuttlePrice } from "@/lib/shuttle-pricing";
import type { SmartPricingInput } from "@/lib/smart-pricing";
import type {
  DeliveryCategory,
  DeliveryUrgency,
  InsuranceLevel,
  ShuttleTripType,
  ShuttleVehicleClass,
  VehicleType,
} from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();

  if (body.serviceType === "SHUTTLE") {
    if (!body.pickupCity || !body.pickupProvince || !body.shuttleTripType) {
      return NextResponse.json({ error: "Missing shuttle fields" }, { status: 400 });
    }
    const breakdown = calculateShuttlePrice({
      shuttleTripType: body.shuttleTripType as ShuttleTripType,
      shuttleVehicleClass: (body.shuttleVehicleClass as ShuttleVehicleClass) ?? "SEDAN",
      pickupCity: body.pickupCity,
      pickupProvince: body.pickupProvince,
      dropoffCity: body.dropoffCity ?? body.pickupCity,
      dropoffProvince: body.dropoffProvince ?? body.pickupProvince,
      airportCode: body.airportCode,
      passengerCount: body.passengerCount ? Number(body.passengerCount) : 1,
      luggagePieces: body.luggagePieces ? Number(body.luggagePieces) : undefined,
      hireHours: body.hireHours ? Number(body.hireHours) : undefined,
      urgency: body.urgency ?? "STANDARD",
      isNightDelivery: Boolean(body.isNightDelivery),
    });
    return NextResponse.json({ total: breakdown.total, breakdown });
  }

  const input: SmartPricingInput = {
    vehicleType: body.vehicleType as VehicleType,
    pickupProvince: body.pickupProvince,
    dropoffProvince: body.dropoffProvince,
    pickupCity: body.pickupCity,
    dropoffCity: body.dropoffCity,
    pickupLat: body.pickupLat != null ? Number(body.pickupLat) : undefined,
    pickupLng: body.pickupLng != null ? Number(body.pickupLng) : undefined,
    dropoffLat: body.dropoffLat != null ? Number(body.dropoffLat) : undefined,
    dropoffLng: body.dropoffLng != null ? Number(body.dropoffLng) : undefined,
    weightKg: body.weightKg ? Number(body.weightKg) : undefined,
    urgency: (body.urgency as DeliveryUrgency) ?? "STANDARD",
    cargoSize: body.cargoSize,
    deliveryCategory: body.deliveryCategory as DeliveryCategory,
    isFragile: Boolean(body.isFragile),
    usesTollRoads: Boolean(body.usesTollRoads),
    isNightDelivery: Boolean(body.isNightDelivery),
    insuranceLevel: (body.insuranceLevel as InsuranceLevel) ?? "STANDARD",
    stops: body.stops,
    scheduledAt: body.scheduledAt,
  };

  if (!input.vehicleType || !input.pickupProvince || !input.dropoffProvince) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { total, breakdown } = await estimateBookingPriceFromDb(input);
  const stopCount = Array.isArray(body.stops) ? body.stops.length : 0;
  const times = estimateDeliveryTimes({
    urgency: input.urgency ?? "STANDARD",
    distanceKm: breakdown.distanceKm,
    scheduledAt: body.scheduledAt,
    stopCount,
  });
  return NextResponse.json({ total, breakdown, times });
}
