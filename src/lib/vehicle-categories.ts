import { DEFAULT_VEHICLE_RATES } from "@/lib/pricing-config";
import type { VehicleType } from "@/lib/types";

export type VehicleCategory = {
  id: string;
  label: string;
  description: string;
  loadCapacity: string;
  vehicleType: VehicleType;
  startingPrice: number;
};

/** Customer-facing vehicle cards (maps to internal VehicleType for pricing). */
export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  {
    id: "motorcycle",
    label: "Motorcycle",
    description: "Documents, small parcels, and urgent same-day items",
    loadCapacity: "Up to 15 kg",
    vehicleType: "MOTORCYCLE",
    startingPrice: DEFAULT_VEHICLE_RATES.MOTORCYCLE.base,
  },
  {
    id: "car",
    label: "Car",
    description: "Small parcels, samples, and light boxes",
    loadCapacity: "Up to 200 kg",
    vehicleType: "CAR",
    startingPrice: DEFAULT_VEHICLE_RATES.CAR.base,
  },
  {
    id: "bakkie",
    label: "Bakkie",
    description: "Appliances, furniture, and local business deliveries",
    loadCapacity: "Up to 1,200 kg",
    vehicleType: "BAKKIE",
    startingPrice: DEFAULT_VEHICLE_RATES.BAKKIE.base,
  },
  {
    id: "panel-van",
    label: "Panel Van",
    description: "Commercial goods, pallets, and retail stock",
    loadCapacity: "Up to 1,500 kg",
    vehicleType: "PANEL_VAN",
    startingPrice: DEFAULT_VEHICLE_RATES.PANEL_VAN.base,
  },
  {
    id: "truck",
    label: "Truck",
    description: "Inter-city freight and medium commercial loads",
    loadCapacity: "Up to 16,000 kg",
    vehicleType: "MEDIUM_TRUCK",
    startingPrice: DEFAULT_VEHICLE_RATES.MEDIUM_TRUCK.base,
  },
  {
    id: "truck-trailer",
    label: "Truck with Trailer",
    description: "Maximum capacity loads nationwide",
    loadCapacity: "Up to 56,000 kg",
    vehicleType: "TRAILER_COMBO",
    startingPrice: DEFAULT_VEHICLE_RATES.TRAILER_COMBO.base,
  },
  {
    id: "furniture-truck",
    label: "Furniture Moving Truck",
    description: "Household moves, office relocations, and bulky items",
    loadCapacity: "Up to 8,000 kg",
    vehicleType: "LIGHT_TRUCK",
    startingPrice: DEFAULT_VEHICLE_RATES.LIGHT_TRUCK.base,
  },
  {
    id: "heavy-equipment",
    label: "Heavy Equipment Transport",
    description: "Machinery, generators, and industrial assets",
    loadCapacity: "Up to 34,000 kg",
    vehicleType: "HEAVY_TRUCK",
    startingPrice: DEFAULT_VEHICLE_RATES.HEAVY_TRUCK.base,
  },
];

export function categoryByVehicleType(type: VehicleType): VehicleCategory | undefined {
  return VEHICLE_CATEGORIES.find((c) => c.vehicleType === type);
}
