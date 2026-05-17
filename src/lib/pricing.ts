import {
  DEFAULT_PRICING_CONFIG,
  getPricingConfig,
  type PricingConfig,
} from "@/lib/pricing-config";
import {
  calculateSmartPrice,
  type SmartPricingInput,
  type PriceBreakdown,
} from "@/lib/smart-pricing";
import type { DeliveryUrgency, VehicleType } from "@/lib/types";

export { estimateDistanceKm } from "@/lib/pricing-distance";

export function estimateBookingPrice(
  vehicleType: VehicleType,
  pickupProvince: string,
  dropoffProvince: string,
  weightKg?: number | null,
  urgency: DeliveryUrgency = "STANDARD",
  cargoSize?: string | null,
  config: PricingConfig = DEFAULT_PRICING_CONFIG,
  extras?: Partial<SmartPricingInput>,
): number {
  return calculateSmartPrice(
    {
      vehicleType,
      pickupProvince,
      dropoffProvince,
      weightKg,
      urgency,
      cargoSize,
      ...extras,
    },
    config,
  ).total;
}

export function estimateBookingPriceWithBreakdown(
  input: SmartPricingInput,
  config: PricingConfig = DEFAULT_PRICING_CONFIG,
): PriceBreakdown {
  return calculateSmartPrice(input, config);
}

export async function estimateBookingPriceFromDb(
  input: SmartPricingInput,
): Promise<{ total: number; breakdown: PriceBreakdown }> {
  const config = await getPricingConfig();
  const breakdown = calculateSmartPrice(input, config);
  return { total: breakdown.total, breakdown };
}

export function generateBookingReference(): string {
  const part = Date.now().toString(36).toUpperCase().slice(-5);
  return `LS-${part}`;
}
