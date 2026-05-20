import { db } from "@/lib/db";
import { estimateDistanceKm } from "@/lib/pricing-distance";
import type { BookingStatus, VehicleType, VerificationStatus } from "@/lib/types";

export async function getDriverProfileForUser(userId: string) {
  return db.driverProfile.findUnique({
    where: { userId },
    include: {
      vehicles: true,
      user: { select: { fullName: true, email: true, phone: true } },
    },
  });
}

export function primaryVehicleType(
  vehicles: { type: string }[],
): VehicleType | null {
  return (vehicles[0]?.type as VehicleType) ?? null;
}

export function canGoOnline(profile: {
  verificationStatus: string;
  accountStatus: string;
}): boolean {
  return (
    profile.verificationStatus === "APPROVED" &&
    profile.accountStatus === "ACTIVE"
  );
}

export function canAcceptJobs(profile: {
  verificationStatus: string;
  accountStatus: string;
  isAvailable: boolean;
}): boolean {
  return canGoOnline(profile) && profile.isAvailable;
}

export function driverCanTakeService(
  profile: { offersFreight: boolean; offersShuttle: boolean; pdpLicenceNumber?: string | null },
  serviceType: string,
): boolean {
  if (serviceType === "SHUTTLE") {
    return profile.offersShuttle && Boolean(profile.pdpLicenceNumber);
  }
  return profile.offersFreight;
}

export function jobMatchesVehicle(
  bookingVehicle: string,
  driverVehicle: VehicleType | null,
): boolean {
  if (!driverVehicle) return false;
  if (bookingVehicle === driverVehicle) return true;
  if (driverVehicle === "HEAVY_TRUCK" && bookingVehicle === "MEDIUM_TRUCK") {
    return true;
  }
  if (driverVehicle === "TRAILER_COMBO") {
    return ["HEAVY_TRUCK", "MEDIUM_TRUCK", "LIGHT_TRUCK"].includes(bookingVehicle);
  }
  return false;
}

export async function getAvailableJobsForDriver(
  driverProfileId: string,
  vehicleType: VehicleType | null,
  profile?: {
    offersFreight: boolean;
    offersShuttle: boolean;
    pdpLicenceNumber?: string | null;
  },
) {
  const declined = await db.bookingDecline.findMany({
    where: { driverProfileId },
    select: { bookingId: true },
  });
  const declinedIds = declined.map((d) => d.bookingId);

  const open = await db.booking.findMany({
    where: {
      status: "SEARCHING_DRIVER",
      ...(declinedIds.length > 0 ? { id: { notIn: declinedIds } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return open.filter((b) => {
    if (profile && !driverCanTakeService(profile, b.serviceType)) return false;
    return jobMatchesVehicle(b.vehicleType, vehicleType);
  });
}

export function distanceLabel(
  pickupProvince: string,
  dropoffProvince: string,
): string {
  const km = estimateDistanceKm(pickupProvince, dropoffProvince);
  return `~${km} km`;
}

export async function getDriverEarningsStats(driverProfileId: string) {
  const completed = await db.booking.findMany({
    where: { driverId: driverProfileId, status: "DELIVERED" },
    select: {
      driverEarnings: true,
      estimatedPrice: true,
      platformFee: true,
      finalPrice: true,
    },
  });

  const totalEarnings = completed.reduce(
    (sum, b) => sum + (b.driverEarnings ?? b.estimatedPrice * 0.85),
    0,
  );
  const commissionDeducted = completed.reduce(
    (sum, b) => sum + (b.platformFee ?? (b.finalPrice ?? b.estimatedPrice) * 0.15),
    0,
  );

  const payouts = await db.payout.findMany({
    where: { driverProfileId },
    orderBy: { createdAt: "desc" },
  });

  const pendingPayout = payouts
    .filter((p) => p.status === "PENDING" || p.status === "PROCESSING")
    .reduce((s, p) => s + p.amount, 0);

  const paidPayout = payouts
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + p.amount, 0);

  return {
    completedCount: completed.length,
    totalEarnings,
    commissionDeducted,
    pendingPayout,
    paidPayout,
    payouts,
  };
}

export const DRIVER_STATUS_FLOW: BookingStatus[] = [
  "DRIVER_ASSIGNED",
  "EN_ROUTE_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "NEAR_DESTINATION",
  "DELIVERED",
];

export function verificationDisplay(status: VerificationStatus): string {
  if (status === "PENDING") return "Not submitted";
  if (status === "UNDER_REVIEW") return "Pending review";
  if (status === "APPROVED") return "Approved";
  return "Rejected";
}
