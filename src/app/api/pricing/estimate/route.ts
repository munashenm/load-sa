import { NextResponse } from "next/server";
import { estimateBookingPriceFromDb } from "@/lib/pricing";
import type { SmartPricingInput } from "@/lib/smart-pricing";
import type { DeliveryCategory, DeliveryUrgency, InsuranceLevel, VehicleType } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const input: SmartPricingInput = {
    vehicleType: body.vehicleType as VehicleType,
    pickupProvince: body.pickupProvince,
    dropoffProvince: body.dropoffProvince,
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
  return NextResponse.json({ total, breakdown });
}
