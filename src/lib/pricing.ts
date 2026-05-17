import type { DeliveryUrgency, VehicleType } from "@/lib/types";

const BASE_FARE: Record<VehicleType, number> = {
  MOTORCYCLE: 85,
  BAKKIE: 350,
  PANEL_VAN: 450,
  LIGHT_TRUCK: 1200,
  MEDIUM_TRUCK: 2800,
  HEAVY_TRUCK: 5500,
  TRAILER_COMBO: 8500,
  OTHER: 600,
};

const PER_KM_RATE: Record<VehicleType, number> = {
  MOTORCYCLE: 6,
  BAKKIE: 12,
  PANEL_VAN: 14,
  LIGHT_TRUCK: 22,
  MEDIUM_TRUCK: 35,
  HEAVY_TRUCK: 48,
  TRAILER_COMBO: 58,
  OTHER: 18,
};

/** Rough distance estimate from province pair (national coverage MVP). */
export function estimateDistanceKm(
  pickupProvince: string,
  dropoffProvince: string,
): number {
  if (pickupProvince === dropoffProvince) {
    return 120;
  }
  const longHaulPairs = new Set([
    "Western Cape-Gauteng",
    "Gauteng-Western Cape",
    "Western Cape-KwaZulu-Natal",
    "KwaZulu-Natal-Western Cape",
    "Eastern Cape-Gauteng",
    "Gauteng-Eastern Cape",
  ]);
  const key = `${pickupProvince}-${dropoffProvince}`;
  if (longHaulPairs.has(key)) {
    return 1400;
  }
  return 650;
}

const URGENCY_MULTIPLIER: Record<DeliveryUrgency, number> = {
  STANDARD: 1,
  SAME_DAY: 1.25,
  EXPRESS: 1.45,
};

const SIZE_MULTIPLIER: Record<string, number> = {
  SMALL: 1,
  MEDIUM: 1.05,
  LARGE: 1.12,
  OVERSIZED: 1.25,
};

export function estimateBookingPrice(
  vehicleType: VehicleType,
  pickupProvince: string,
  dropoffProvince: string,
  weightKg?: number | null,
  urgency: DeliveryUrgency = "STANDARD",
  cargoSize?: string | null,
): number {
  const km = estimateDistanceKm(pickupProvince, dropoffProvince);
  let price = BASE_FARE[vehicleType] + PER_KM_RATE[vehicleType] * km;

  if (weightKg && weightKg > 5000) {
    price *= 1.15;
  }

  price *= URGENCY_MULTIPLIER[urgency] ?? 1;
  if (cargoSize && SIZE_MULTIPLIER[cargoSize]) {
    price *= SIZE_MULTIPLIER[cargoSize];
  }

  return Math.round(price / 10) * 10;
}

export function generateBookingReference(): string {
  const part = Date.now().toString(36).toUpperCase().slice(-5);
  return `LS-${part}`;
}
