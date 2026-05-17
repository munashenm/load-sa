import type { Booking } from "@prisma/client";

export function isChatUnlocked(paymentStatus: string): boolean {
  return paymentStatus === "PAID";
}

export function canAccessChat(
  booking: Pick<Booking, "customerId" | "driverId" | "paymentStatus">,
  user: { id: string; role: string; driverProfile?: { id: string } | null },
): boolean {
  if (user.role === "ADMIN") return true;
  if (!isChatUnlocked(booking.paymentStatus)) return false;

  if (user.role === "CUSTOMER" && booking.customerId === user.id) return true;
  if (
    user.role === "DRIVER" &&
    user.driverProfile &&
    booking.driverId === user.driverProfile.id
  ) {
    return true;
  }
  return false;
}

/** Strip phone until payment confirmed (drivers must not see customer phone early). */
export function maskContactForBooking<
  T extends { phone?: string; fullName: string },
>(
  contact: T | null | undefined,
  viewerRole: string,
  paymentStatus: string,
  isOwnContact: boolean,
): T | null | undefined {
  if (!contact) return contact;
  if (viewerRole === "ADMIN") return contact;
  if (isOwnContact) return contact;
  if (!isChatUnlocked(paymentStatus)) {
    return { ...contact, phone: "Available after payment" };
  }
  return contact;
}
