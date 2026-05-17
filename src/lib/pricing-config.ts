import { db } from "@/lib/db";
import type { DeliveryUrgency, VehicleType } from "@/lib/types";

export type VehicleRate = { base: number; perKm: number };

export type PricingConfig = {
  baseFee: number;
  pricePerKm: number;
  sameDaySurchargePct: number;
  expressSurchargePct: number;
  fragileSurchargePct: number;
  tollSurchargePct: number;
  nightSurchargePct: number;
  insuredSurchargePct: number;
  multiStopSurchargePct: number;
  vehicleRates: Record<VehicleType, VehicleRate>;
};

const VEHICLE_TYPES: VehicleType[] = [
  "MOTORCYCLE",
  "CAR",
  "BAKKIE",
  "PANEL_VAN",
  "LIGHT_TRUCK",
  "MEDIUM_TRUCK",
  "HEAVY_TRUCK",
  "TRAILER_COMBO",
  "OTHER",
];

export const DEFAULT_VEHICLE_RATES: Record<VehicleType, VehicleRate> = {
  MOTORCYCLE: { base: 85, perKm: 6 },
  CAR: { base: 200, perKm: 10 },
  BAKKIE: { base: 350, perKm: 12 },
  PANEL_VAN: { base: 450, perKm: 14 },
  LIGHT_TRUCK: { base: 1200, perKm: 22 },
  MEDIUM_TRUCK: { base: 2800, perKm: 35 },
  HEAVY_TRUCK: { base: 5500, perKm: 48 },
  TRAILER_COMBO: { base: 8500, perKm: 58 },
  OTHER: { base: 600, perKm: 18 },
};

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  baseFee: 350,
  pricePerKm: 12,
  sameDaySurchargePct: 25,
  expressSurchargePct: 45,
  fragileSurchargePct: 12,
  tollSurchargePct: 8,
  nightSurchargePct: 15,
  insuredSurchargePct: 18,
  multiStopSurchargePct: 20,
  vehicleRates: DEFAULT_VEHICLE_RATES,
};

export function parseVehicleRatesJson(json: string | null | undefined): Record<VehicleType, VehicleRate> {
  if (!json) return { ...DEFAULT_VEHICLE_RATES };
  try {
    const parsed = JSON.parse(json) as Partial<Record<VehicleType, VehicleRate>>;
    const merged = { ...DEFAULT_VEHICLE_RATES };
    for (const t of VEHICLE_TYPES) {
      if (parsed[t]?.base != null && parsed[t]?.perKm != null) {
        merged[t] = parsed[t]!;
      }
    }
    return merged;
  } catch {
    return { ...DEFAULT_VEHICLE_RATES };
  }
}

export async function getPricingConfig(): Promise<PricingConfig> {
  const row = await db.platformSettings.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULT_PRICING_CONFIG;

  return {
    baseFee: row.baseFee ?? DEFAULT_PRICING_CONFIG.baseFee,
    pricePerKm: row.pricePerKm ?? DEFAULT_PRICING_CONFIG.pricePerKm,
    sameDaySurchargePct: row.sameDaySurchargePct ?? DEFAULT_PRICING_CONFIG.sameDaySurchargePct,
    expressSurchargePct: row.expressSurchargePct ?? DEFAULT_PRICING_CONFIG.expressSurchargePct,
    fragileSurchargePct: row.fragileSurchargePct ?? DEFAULT_PRICING_CONFIG.fragileSurchargePct,
    tollSurchargePct: row.tollSurchargePct ?? DEFAULT_PRICING_CONFIG.tollSurchargePct,
    nightSurchargePct: row.nightSurchargePct ?? DEFAULT_PRICING_CONFIG.nightSurchargePct,
    insuredSurchargePct: row.insuredSurchargePct ?? DEFAULT_PRICING_CONFIG.insuredSurchargePct,
    multiStopSurchargePct: row.multiStopSurchargePct ?? DEFAULT_PRICING_CONFIG.multiStopSurchargePct,
    vehicleRates: parseVehicleRatesJson(row.vehicleRatesJson),
  };
}

export function urgencyMultiplier(
  urgency: DeliveryUrgency,
  config: PricingConfig,
): number {
  if (urgency === "EXPRESS") return 1 + config.expressSurchargePct / 100;
  if (urgency === "SAME_DAY") return 1 + config.sameDaySurchargePct / 100;
  return 1;
}
