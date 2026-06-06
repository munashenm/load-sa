import { estimateDistanceKm } from "@/lib/pricing-distance";
import {
  DEFAULT_PRICING_CONFIG,
  urgencyMultiplier,
  type PricingConfig,
} from "@/lib/pricing-config";
import type {
  DeliveryCategory,
  DeliveryUrgency,
  InsuranceLevel,
  VehicleType,
} from "@/lib/types";

export type DeliveryStop = {
  address: string;
  city: string;
  province: string;
  label?: string;
  lat?: number;
  lng?: number;
};

export type SmartPricingInput = {
  vehicleType: VehicleType;
  pickupProvince: string;
  dropoffProvince: string;
  pickupCity?: string;
  dropoffCity?: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
  /** Pre-resolved route distance (km). Falls back to province estimate when omitted. */
  distanceKm?: number;
  distanceSource?: "google" | "coords" | "province";
  weightKg?: number | null;
  urgency?: DeliveryUrgency;
  cargoSize?: string | null;
  deliveryCategory?: DeliveryCategory;
  isFragile?: boolean;
  usesTollRoads?: boolean;
  isNightDelivery?: boolean;
  insuranceLevel?: InsuranceLevel;
  stops?: DeliveryStop[];
  scheduledAt?: Date | string | null;
};

export type PriceLine = { label: string; amount: number };
export type PriceBreakdown = {
  lines: PriceLine[];
  subtotal: number;
  total: number;
  distanceKm: number;
};

const SIZE_MULTIPLIER: Record<string, number> = {
  SMALL: 1,
  MEDIUM: 1.05,
  LARGE: 1.12,
  OVERSIZED: 1.25,
};

const CATEGORY_MULTIPLIER: Record<DeliveryCategory, number> = {
  DOCUMENTS: 0.92,
  ELECTRONICS: 1.05,
  FURNITURE: 1.08,
  APPLIANCES: 1.1,
  CONSTRUCTION: 1.15,
  VEHICLE_TRANSPORT: 1.35,
  FRAGILE: 1.12,
  GENERAL: 1,
};

const WEIGHT_TIERS = [
  { maxKg: 50, mult: 1 },
  { maxKg: 500, mult: 1.04 },
  { maxKg: 2000, mult: 1.08 },
  { maxKg: 5000, mult: 1.12 },
  { maxKg: 15000, mult: 1.2 },
  { maxKg: Infinity, mult: 1.35 },
];

function weightMultiplier(kg?: number | null): number {
  if (!kg || kg <= 0) return 1;
  for (const tier of WEIGHT_TIERS) {
    if (kg <= tier.maxKg) return tier.mult;
  }
  return 1.35;
}

function isNightSlot(scheduledAt?: Date | string | null): boolean {
  if (!scheduledAt) return false;
  const d = typeof scheduledAt === "string" ? new Date(scheduledAt) : scheduledAt;
  const h = d.getHours();
  return h >= 20 || h < 6;
}

export function calculateSmartPrice(
  input: SmartPricingInput,
  config: PricingConfig = DEFAULT_PRICING_CONFIG,
): PriceBreakdown {
  const km =
    input.distanceKm ??
    estimateDistanceKm(input.pickupProvince, input.dropoffProvince);
  const distanceLabel =
    input.distanceSource === "google"
      ? `Route distance (${km} km)`
      : input.distanceSource === "coords"
        ? `Estimated route (${km} km)`
        : `Distance (~${km} km)`;
  const rates = config.vehicleRates[input.vehicleType];
  const lines: PriceLine[] = [];

  const baseFare = rates.base;
  const distanceFare = Math.round(rates.perKm * km);
  lines.push({ label: `${input.vehicleType} base fare`, amount: baseFare });
  lines.push({ label: distanceLabel, amount: distanceFare });

  let subtotal = baseFare + distanceFare + config.baseFee * 0.1;

  const urgency = input.urgency ?? "STANDARD";
  const urgMult = urgencyMultiplier(urgency, config);
  if (urgMult > 1) {
    const surcharge = Math.round(subtotal * (urgMult - 1));
    const label =
      urgency === "EXPRESS"
        ? "Express priority"
        : urgency === "SAME_DAY"
          ? "Same-day delivery"
          : "Urgency";
    lines.push({ label, amount: surcharge });
    subtotal += surcharge;
  }

  if (input.cargoSize && SIZE_MULTIPLIER[input.cargoSize]) {
    const mult = SIZE_MULTIPLIER[input.cargoSize];
    if (mult > 1) {
      const add = Math.round(subtotal * (mult - 1));
      lines.push({ label: "Size category", amount: add });
      subtotal += add;
    }
  }

  const cat = input.deliveryCategory ?? "GENERAL";
  const catMult = CATEGORY_MULTIPLIER[cat];
  if (catMult !== 1) {
    const add = Math.round(subtotal * (catMult - 1));
    lines.push({ label: "Delivery category", amount: add });
    subtotal += add;
  }

  const wMult = weightMultiplier(input.weightKg);
  if (wMult > 1) {
    const add = Math.round(subtotal * (wMult - 1));
    lines.push({ label: "Weight tier", amount: add });
    subtotal += add;
  }

  if (input.isFragile) {
    const add = Math.round(subtotal * (config.fragileSurchargePct / 100));
    lines.push({ label: "Fragile handling", amount: add });
    subtotal += add;
  }

  if (input.usesTollRoads) {
    const add = Math.round(subtotal * (config.tollSurchargePct / 100));
    lines.push({ label: "Toll roads", amount: add });
    subtotal += add;
  }

  const night =
    input.isNightDelivery || isNightSlot(input.scheduledAt);
  if (night) {
    const add = Math.round(subtotal * (config.nightSurchargePct / 100));
    lines.push({ label: "Night delivery", amount: add });
    subtotal += add;
  }

  if (input.insuranceLevel === "INSURED") {
    const add = Math.round(subtotal * (config.insuredSurchargePct / 100));
    lines.push({ label: "Insured delivery", amount: add });
    subtotal += add;
  }

  const stopCount = input.stops?.length ?? 0;
  if (stopCount > 0) {
    const add = Math.round(
      subtotal * (config.multiStopSurchargePct / 100) * stopCount,
    );
    lines.push({
      label: `Multi-stop (${stopCount} extra ${stopCount === 1 ? "stop" : "stops"})`,
      amount: add,
    });
    subtotal += add;
  }

  const total = Math.round(subtotal / 10) * 10;

  return { lines, subtotal, total, distanceKm: km };
}

export function generateDeliveryOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
