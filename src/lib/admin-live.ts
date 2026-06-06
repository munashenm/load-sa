import { db } from "@/lib/db";
import { resolveBookingCoords } from "@/lib/sa-data";

const ACTIVE_STATUSES = [
  "DRIVER_ASSIGNED",
  "EN_ROUTE_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "NEAR_DESTINATION",
] as const;

export type LiveDeliveryRow = {
  id: string;
  reference: string;
  status: string;
  pickupCity: string;
  dropoffCity: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  driverLat: number | null;
  driverLng: number | null;
  driverName: string | null;
  customerName: string;
  updatedAt: string;
};

export async function getActiveDeliveriesForMap(): Promise<LiveDeliveryRow[]> {
  const bookings = await db.booking.findMany({
    where: { status: { in: [...ACTIVE_STATUSES] } },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      customer: { select: { fullName: true } },
      driver: { include: { user: { select: { fullName: true } } } },
    },
  });

  return bookings.map((b) => {
    const { pickup, dropoff } = resolveBookingCoords(b);
    return {
      id: b.id,
      reference: b.reference,
      status: b.status,
      pickupCity: b.pickupCity,
      dropoffCity: b.dropoffCity,
      pickupLat: pickup.lat,
      pickupLng: pickup.lng,
      dropoffLat: dropoff.lat,
      dropoffLng: dropoff.lng,
      driverLat: b.driverLat,
      driverLng: b.driverLng,
      driverName: b.driver?.user.fullName ?? null,
      customerName: b.customer.fullName,
      updatedAt: b.updatedAt.toISOString(),
    };
  });
}
