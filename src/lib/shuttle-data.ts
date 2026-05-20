import type { ShuttleTripType, ShuttleVehicleClass } from "@/lib/types";

export const SHUTTLE_DESCRIPTION =
  "Book airport transfers and private hire across South Africa — sedans, SUVs, and minibuses with verified passenger drivers (PDP).";

export const SA_AIRPORTS = [
  { code: "ORT", name: "OR Tambo (Johannesburg)", city: "Kempton Park", province: "Gauteng" },
  { code: "LANS", name: "Lanseria", city: "Lanseria", province: "Gauteng" },
  { code: "CPT", name: "Cape Town International", city: "Cape Town", province: "Western Cape" },
  { code: "DUR", name: "King Shaka (Durban)", city: "Durban", province: "KwaZulu-Natal" },
  { code: "PLZ", name: "Chief Dawid Stuurman (Gqeberha)", city: "Gqeberha", province: "Eastern Cape" },
  { code: "BFN", name: "Bram Fischer (Bloemfontein)", city: "Bloemfontein", province: "Free State" },
] as const;

export const SHUTTLE_TRIP_OPTIONS: {
  value: ShuttleTripType;
  label: string;
  description: string;
}[] = [
  {
    value: "AIRPORT_DROPOFF",
    label: "To airport",
    description: "Pick up at your address, drop at the airport",
  },
  {
    value: "AIRPORT_PICKUP",
    label: "From airport",
    description: "Meet at arrivals, drop at your destination",
  },
  {
    value: "POINT_TO_POINT",
    label: "Point to point",
    description: "City or inter-city passenger trip",
  },
  {
    value: "PRIVATE_HIRE_HOURLY",
    label: "Private hire (hourly)",
    description: "Driver and vehicle for a set number of hours",
  },
];

export const SHUTTLE_VEHICLE_OPTIONS: {
  value: ShuttleVehicleClass;
  label: string;
  description: string;
  maxPassengers: number;
  platformVehicle: "CAR" | "PANEL_VAN";
}[] = [
  {
    value: "SEDAN",
    label: "Sedan",
    description: "1–3 passengers, standard luggage",
    maxPassengers: 3,
    platformVehicle: "CAR",
  },
  {
    value: "SUV",
    label: "SUV",
    description: "1–4 passengers, extra luggage",
    maxPassengers: 4,
    platformVehicle: "CAR",
  },
  {
    value: "LUXURY",
    label: "Luxury sedan",
    description: "Executive airport transfer",
    maxPassengers: 3,
    platformVehicle: "CAR",
  },
  {
    value: "MINIBUS_7",
    label: "7-seater",
    description: "Families or small groups",
    maxPassengers: 7,
    platformVehicle: "PANEL_VAN",
  },
  {
    value: "MINIBUS_16",
    label: "Minibus (up to 16)",
    description: "Corporate groups and events",
    maxPassengers: 16,
    platformVehicle: "PANEL_VAN",
  },
];

export function shuttleClassToVehicleType(
  shuttleClass: ShuttleVehicleClass,
): "CAR" | "PANEL_VAN" {
  const opt = SHUTTLE_VEHICLE_OPTIONS.find((o) => o.value === shuttleClass);
  return opt?.platformVehicle ?? "CAR";
}
