import { db } from "@/lib/db";

export type NotificationType =
  | "DRIVER_ACCEPTED"
  | "EN_ROUTE_PICKUP"
  | "GOODS_PICKED_UP"
  | "IN_TRANSIT"
  | "NEAR_DESTINATION"
  | "DELIVERED";

const COPY: Record<
  NotificationType,
  { title: string; message: (ref: string) => string }
> = {
  DRIVER_ACCEPTED: {
    title: "Driver assigned",
    message: (ref) => `A driver accepted your delivery ${ref}.`,
  },
  EN_ROUTE_PICKUP: {
    title: "Driver en route",
    message: (ref) => `Your driver is on the way to pickup for ${ref}.`,
  },
  GOODS_PICKED_UP: {
    title: "Goods picked up",
    message: (ref) => `Your goods have been picked up for ${ref}.`,
  },
  IN_TRANSIT: {
    title: "In transit",
    message: (ref) => `Your delivery ${ref} is on the way.`,
  },
  NEAR_DESTINATION: {
    title: "Driver nearby",
    message: (ref) => `Your driver is near the drop-off for ${ref}.`,
  },
  DELIVERED: {
    title: "Delivered",
    message: (ref) => `Delivery ${ref} has been completed.`,
  },
};

export async function notifyCustomer(
  customerId: string,
  bookingId: string,
  reference: string,
  type: NotificationType,
): Promise<void> {
  const copy = COPY[type];
  await db.notification.create({
    data: {
      userId: customerId,
      bookingId,
      type,
      title: copy.title,
      message: copy.message(reference),
    },
  });
}

export async function notifyCustomerForStatus(
  booking: {
    id: string;
    reference: string;
    customerId: string;
    status: string;
  },
  previousStatus?: string,
): Promise<void> {
  if (booking.status === previousStatus) return;

  const map: Record<string, NotificationType | undefined> = {
    DRIVER_ASSIGNED: "DRIVER_ACCEPTED",
    PICKED_UP: "GOODS_PICKED_UP",
    IN_TRANSIT: "IN_TRANSIT",
    DELIVERED: "DELIVERED",
  };

  const type = map[booking.status];
  if (type) {
    await notifyCustomer(booking.customerId, booking.id, booking.reference, type);
  }
}
