import {
  DEFAULT_PRICING_CONFIG,
  getPricingConfig,
  urgencyMultiplier,
  type PricingConfig,
} from "@/lib/pricing-config";
import type { DeliveryUrgency, VehicleType } from "@/lib/types";

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

const SIZE_MULTIPLIER: Record<string, number> = {
  SMALL: 1,
  MEDIUM: 1.05,
  LARGE: 1.12,
  OVERSIZED: 1.25,
};

function computePrice(
  config: PricingConfig,
  vehicleType: VehicleType,
  pickupProvince: string,
  dropoffProvince: string,
  weightKg?: number | null,
  urgency: DeliveryUrgency = "STANDARD",
  cargoSize?: string | null,
): number {
  const km = estimateDistanceKm(pickupProvince, dropoffProvince);
  const rates = config.vehicleRates[vehicleType];
  let price = rates.base + rates.perKm * km + config.baseFee * 0.1;

  if (weightKg && weightKg > 5000) {
    price *= 1.15;
  }

  price *= urgencyMultiplier(urgency, config);
  if (cargoSize && SIZE_MULTIPLIER[cargoSize]) {
    price *= SIZE_MULTIPLIER[cargoSize];
  }

  return Math.round(price / 10) * 10;
}

export function estimateBookingPrice(
  vehicleType: VehicleType,
  pickupProvince: string,
  dropoffProvince: string,
  weightKg?: number | null,
  urgency: DeliveryUrgency = "STANDARD",
  cargoSize?: string | null,
  config: PricingConfig = DEFAULT_PRICING_CONFIG,
): number {
  return computePrice(
    config,
    vehicleType,
    pickupProvince,
    dropoffProvince,
    weightKg,
    urgency,
    cargoSize,
  );
}

export async function estimateBookingPriceFromDb(
  vehicleType: VehicleType,
  pickupProvince: string,
  dropoffProvince: string,
  weightKg?: number | null,
  urgency: DeliveryUrgency = "STANDARD",
  cargoSize?: string | null,
): Promise<number> {
  const config = await getPricingConfig();
  return computePrice(
    config,
    vehicleType,
    pickupProvince,
    dropoffProvince,
    weightKg,
    urgency,
    cargoSize,
  );
}

export function generateBookingReference(): string {
  const part = Date.now().toString(36).toUpperCase().slice(-5);
  return `LS-${part}`;
}
