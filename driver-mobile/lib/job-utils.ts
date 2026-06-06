export type JobStatus =
  | "SEARCHING_DRIVER"
  | "DRIVER_ASSIGNED"
  | "EN_ROUTE_PICKUP"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "NEAR_DESTINATION"
  | "DELIVERED"
  | "CANCELLED";

const STATUS_LABELS: Record<JobStatus, string> = {
  SEARCHING_DRIVER: "Finding driver",
  DRIVER_ASSIGNED: "Driver assigned",
  EN_ROUTE_PICKUP: "En route to pickup",
  PICKED_UP: "Item collected",
  IN_TRANSIT: "In transit",
  NEAR_DESTINATION: "Arriving soon",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const NEXT_STATUS: Partial<Record<JobStatus, JobStatus>> = {
  DRIVER_ASSIGNED: "EN_ROUTE_PICKUP",
  EN_ROUTE_PICKUP: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "NEAR_DESTINATION",
  NEAR_DESTINATION: "DELIVERED",
};

export function jobStatusLabel(status: string): string {
  return STATUS_LABELS[status as JobStatus] ?? status;
}

export function nextJobStatus(status: string): JobStatus | null {
  return NEXT_STATUS[status as JobStatus] ?? null;
}

export function mapsDirectionsUrl(
  address: string,
  city: string,
  lat?: number | null,
  lng?: number | null,
): string {
  const destination =
    lat != null && lng != null
      ? `${lat},${lng}`
      : encodeURIComponent(`${address}, ${city}, South Africa`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export type DeliveryStop = {
  address: string;
  city: string;
  province: string;
  label?: string;
  lat?: number;
  lng?: number;
};

export function parseStopsJson(stopsJson: string | null | undefined): DeliveryStop[] {
  if (!stopsJson) return [];
  try {
    const parsed = JSON.parse(stopsJson) as DeliveryStop[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
