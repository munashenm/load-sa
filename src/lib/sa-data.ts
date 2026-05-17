import type { CargoSize, DeliveryUrgency, LoadPreference, VehicleType } from "@/lib/types";

export const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

export type SAProvince = (typeof SA_PROVINCES)[number];

export const MAJOR_CITIES: Record<SAProvince, string[]> = {
  "Eastern Cape": ["Gqeberha", "East London", "Mthatha", "Queenstown"],
  "Free State": ["Bloemfontein", "Welkom", "Kroonstad"],
  Gauteng: ["Johannesburg", "Pretoria", "Soweto", "Midrand", "Centurion"],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Richards Bay", "Newcastle"],
  Limpopo: ["Polokwane", "Tzaneen", "Musina"],
  Mpumalanga: ["Mbombela", "Emalahleni", "Secunda"],
  "Northern Cape": ["Kimberley", "Upington", "Springbok"],
  "North West": ["Mahikeng", "Rustenburg", "Klerksdorp"],
  "Western Cape": ["Cape Town", "Stellenbosch", "George", "Mossel Bay"],
};

export const VEHICLE_OPTIONS: {
  value: VehicleType;
  label: string;
  description: string;
  maxWeightKg: number;
}[] = [
  {
    value: "MOTORCYCLE",
    label: "Motorcycle / scooter",
    description: "Documents and small parcels",
    maxWeightKg: 15,
  },
  {
    value: "BAKKIE",
    label: "Bakkie",
    description: "Furniture, appliances, local moves",
    maxWeightKg: 1200,
  },
  {
    value: "PANEL_VAN",
    label: "Panel van",
    description: "Commercial goods, pallets",
    maxWeightKg: 1500,
  },
  {
    value: "LIGHT_TRUCK",
    label: "Light truck (4–8 ton)",
    description: "Township deliveries, building supplies",
    maxWeightKg: 8000,
  },
  {
    value: "MEDIUM_TRUCK",
    label: "Medium truck (8–16 ton)",
    description: "Inter-city freight",
    maxWeightKg: 16000,
  },
  {
    value: "HEAVY_TRUCK",
    label: "Heavy truck (16+ ton)",
    description: "Long-haul, bulk cargo",
    maxWeightKg: 34000,
  },
  {
    value: "TRAILER_COMBO",
    label: "Truck + trailer",
    description: "Maximum capacity loads nationwide",
    maxWeightKg: 56000,
  },
  {
    value: "OTHER",
    label: "Other movable",
    description: "Custom vehicle — describe in booking notes",
    maxWeightKg: 5000,
  },
];

export const CARGO_SIZE_OPTIONS: {
  value: CargoSize;
  label: string;
  description: string;
}[] = [
  { value: "SMALL", label: "Small", description: "Parcels, boxes, single items" },
  { value: "MEDIUM", label: "Medium", description: "Furniture, multiple pallets" },
  { value: "LARGE", label: "Large", description: "Full vehicle load" },
  { value: "OVERSIZED", label: "Oversized", description: "Machinery, abnormal load" },
];

export const URGENCY_OPTIONS: {
  value: DeliveryUrgency;
  label: string;
  description: string;
}[] = [
  { value: "STANDARD", label: "Standard", description: "Flexible pickup within 1–3 days" },
  { value: "SAME_DAY", label: "Same day", description: "Pickup and delivery today" },
  { value: "EXPRESS", label: "Express", description: "Highest priority — ASAP" },
];

export const LOAD_PREFERENCE_OPTIONS: {
  value: LoadPreference;
  label: string;
  description: string;
}[] = [
  {
    value: "ANY",
    label: "Any load",
    description: "Full loads and backhauls",
  },
  {
    value: "EMPTY_RETURN_ONLY",
    label: "Empty return only",
    description: "I am driving back empty and want a paid backhaul",
  },
  {
    value: "FULL_LOAD_ONLY",
    label: "Full loads only",
    description: "Dedicated trips, no partial backhauls",
  },
];

export function formatZAR(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("27") && digits.length === 11) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `+27${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `+27${digits}`;
  }
  return phone.trim();
}

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Johannesburg: { lat: -26.2041, lng: 28.0473 },
  Pretoria: { lat: -25.7479, lng: 28.2293 },
  "Cape Town": { lat: -33.9249, lng: 18.4241 },
  Durban: { lat: -29.8587, lng: 31.0218 },
  Gqeberha: { lat: -33.9608, lng: 25.6022 },
  Bloemfontein: { lat: -29.0852, lng: 26.1596 },
  Polokwane: { lat: -23.9045, lng: 29.4689 },
};

const PROVINCE_CENTER: Record<string, { lat: number; lng: number }> = {
  Gauteng: { lat: -26.2, lng: 28.04 },
  "Western Cape": { lat: -33.92, lng: 18.42 },
  "KwaZulu-Natal": { lat: -29.6, lng: 31.0 },
  "Eastern Cape": { lat: -32.0, lng: 26.0 },
  "Free State": { lat: -29.1, lng: 26.2 },
  Limpopo: { lat: -23.9, lng: 29.5 },
  Mpumalanga: { lat: -25.5, lng: 30.5 },
  "Northern Cape": { lat: -29.0, lng: 22.0 },
  "North West": { lat: -26.0, lng: 25.5 },
};

export function resolveCityCoords(city: string, province: string) {
  return (
    CITY_COORDINATES[city] ??
    PROVINCE_CENTER[province] ?? { lat: -29.0, lng: 24.0 }
  );
}
