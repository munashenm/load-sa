import { db } from "@/lib/db";

export async function getAdminBookingsForExport(limit = 5000) {
  return db.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      customer: { select: { fullName: true, email: true, phone: true } },
      driver: { include: { user: { select: { fullName: true } } } },
      businessAccount: { select: { name: true } },
    },
  });
}

export function adminBookingsToCsv(
  bookings: Awaited<ReturnType<typeof getAdminBookingsForExport>>,
): string {
  const header =
    "Reference,Status,Payment,Service,Pickup City,Dropoff City,Vehicle,Price ZAR,Platform Fee,Driver Earnings,Customer,Driver,Business,Created";
  const rows = bookings.map((b) => {
    const cols = [
      b.reference,
      b.status,
      b.paymentStatus,
      b.serviceType,
      b.pickupCity,
      b.dropoffCity,
      b.vehicleType,
      String(b.finalPrice ?? b.estimatedPrice),
      String(b.platformFee ?? ""),
      String(b.driverEarnings ?? ""),
      `"${b.customer.fullName.replace(/"/g, '""')}"`,
      b.driver ? `"${b.driver.user.fullName.replace(/"/g, '""')}"` : "",
      b.businessAccount ? `"${b.businessAccount.name.replace(/"/g, '""')}"` : "",
      b.createdAt.toISOString(),
    ];
    return cols.join(",");
  });
  return [header, ...rows].join("\n");
}

export async function getAdminDriversForExport() {
  return db.driverProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
      vehicles: { take: 1 },
      _count: { select: { bookings: true } },
    },
  });
}

export function adminDriversToCsv(
  drivers: Awaited<ReturnType<typeof getAdminDriversForExport>>,
): string {
  const header =
    "Name,Email,Phone,Verification,Account Status,Available,Vehicle,Jobs,Wallet ZAR,Joined";
  const rows = drivers.map((d) =>
    [
      `"${d.user.fullName.replace(/"/g, '""')}"`,
      d.user.email,
      d.user.phone,
      d.verificationStatus,
      d.accountStatus,
      d.isAvailable ? "Yes" : "No",
      d.vehicles[0]?.type ?? "",
      String(d._count.bookings),
      String(d.walletBalance),
      d.createdAt.toISOString(),
    ].join(","),
  );
  return [header, ...rows].join("\n");
}
