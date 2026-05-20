import { estimateDistanceKm } from "@/lib/pricing-distance";
import { shuttleClassToVehicleType } from "@/lib/shuttle-data";
import type { PriceBreakdown, PriceLine } from "@/lib/smart-pricing";
import type { ShuttleTripType, ShuttleVehicleClass } from "@/lib/types";

/** Zone hints for airport flat rates (pickup city area → airport code). */
const AIRPORT_ZONE_BASE: Record<string, Record<string, number>> = {
  ORT: {
    Sandton: 420,
    Johannesburg: 450,
    Pretoria: 520,
    Midrand: 380,
    Kempton: 280,
    default: 450,
  },
  LANS: {
    Sandton: 380,
    Johannesburg: 400,
    Pretoria: 480,
    default: 400,
  },
  CPT: {
    "Cape Town": 350,
    Stellenbosch: 480,
    default: 380,
  },
  DUR: {
    Durban: 320,
    Umhlanga: 280,
    default: 340,
  },
  PLZ: { Gqeberha: 280, default: 300 },
  BFN: { Bloemfontein: 260, default: 280 },
};

const CLASS_MULTIPLIER: Record<ShuttleVehicleClass, number> = {
  SEDAN: 1,
  SUV: 1.12,
  LUXURY: 1.45,
  MINIBUS_7: 1.35,
  MINIBUS_16: 1.85,
};

const HOURLY_BASE: Record<ShuttleVehicleClass, number> = {
  SEDAN: 280,
  SUV: 320,
  LUXURY: 450,
  MINIBUS_7: 420,
  MINIBUS_16: 650,
};

function zonePrice(airportCode: string, city: string): number {
  const zones = AIRPORT_ZONE_BASE[airportCode];
  if (!zones) return 400;
  for (const [key, price] of Object.entries(zones)) {
    if (key !== "default" && city.toLowerCase().includes(key.toLowerCase())) {
      return price;
    }
  }
  return zones.default ?? 400;
}

export type ShuttlePricingInput = {
  shuttleTripType: ShuttleTripType;
  shuttleVehicleClass: ShuttleVehicleClass;
  pickupCity: string;
  pickupProvince: string;
  dropoffCity: string;
  dropoffProvince: string;
  airportCode?: string | null;
  passengerCount?: number;
  luggagePieces?: number;
  hireHours?: number;
  urgency?: "STANDARD" | "SAME_DAY" | "EXPRESS";
  isNightDelivery?: boolean;
};

export function calculateShuttlePrice(input: ShuttlePricingInput): PriceBreakdown {
  const lines: PriceLine[] = [];
  const mult = CLASS_MULTIPLIER[input.shuttleVehicleClass];
  let subtotal = 0;

  if (input.shuttleTripType === "PRIVATE_HIRE_HOURLY") {
    const hours = Math.max(2, input.hireHours ?? 3);
    const hourly = HOURLY_BASE[input.shuttleVehicleClass];
    const base = Math.round(hourly * hours * mult);
    lines.push({ label: `Private hire (${hours}h)`, amount: base });
    subtotal = base;
  } else if (
    input.shuttleTripType === "AIRPORT_PICKUP" ||
    input.shuttleTripType === "AIRPORT_DROPOFF"
  ) {
    const code = input.airportCode ?? "ORT";
    const city =
      input.shuttleTripType === "AIRPORT_DROPOFF"
        ? input.pickupCity
        : input.dropoffCity;
    const base = Math.round(zonePrice(code, city) * mult);
    lines.push({ label: `Airport transfer (${code})`, amount: base });
    subtotal = base;
  } else {
    const km = estimateDistanceKm(input.pickupProvince, input.dropoffProvince);
    const vType = shuttleClassToVehicleType(input.shuttleVehicleClass);
    const perKm = vType === "PANEL_VAN" ? 14 : 10;
    const base = 180 + perKm * km;
    const amount = Math.round(base * mult);
    lines.push({ label: `Point-to-point (~${km} km)`, amount });
    subtotal = amount;
  }

  const pax = input.passengerCount ?? 1;
  if (pax > 4) {
    const extra = Math.round((pax - 4) * 35);
    lines.push({ label: "Extra passengers", amount: extra });
    subtotal += extra;
  }

  if (input.luggagePieces && input.luggagePieces > 4) {
    const lug = Math.round((input.luggagePieces - 4) * 25);
    lines.push({ label: "Extra luggage", amount: lug });
    subtotal += lug;
  }

  if (input.urgency === "SAME_DAY") {
    const s = Math.round(subtotal * 0.2);
    lines.push({ label: "Same-day priority", amount: s });
    subtotal += s;
  } else if (input.urgency === "EXPRESS") {
    const s = Math.round(subtotal * 0.35);
    lines.push({ label: "Express priority", amount: s });
    subtotal += s;
  }

  if (input.isNightDelivery) {
    const n = Math.round(subtotal * 0.15);
    lines.push({ label: "After-hours", amount: n });
    subtotal += n;
  }

  const total = Math.round(subtotal / 10) * 10;
  const km = estimateDistanceKm(input.pickupProvince, input.dropoffProvince);

  return { lines, subtotal, total, distanceKm: km };
}
