import { db } from "@/lib/db";

export async function getAdminDashboardStats() {
  const [
    totalBookings,
    pendingBookings,
    activeDeliveries,
    completedDeliveries,
    totalDrivers,
    totalCustomers,
    revenueAgg,
  ] = await Promise.all([
    db.booking.count(),
    db.booking.count({ where: { status: "SEARCHING_DRIVER" } }),
    db.booking.count({
      where: {
        status: { in: ["DRIVER_ASSIGNED", "PICKED_UP", "IN_TRANSIT"] },
      },
    }),
    db.booking.count({ where: { status: "DELIVERED" } }),
    db.driverProfile.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.booking.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { finalPrice: true, platformFee: true, estimatedPrice: true },
    }),
  ]);

  const revenue =
    revenueAgg._sum.finalPrice ??
    revenueAgg._sum.platformFee ??
    revenueAgg._sum.estimatedPrice ??
    0;

  return {
    totalBookings,
    pendingBookings,
    activeDeliveries,
    completedDeliveries,
    totalDrivers,
    totalCustomers,
    revenue,
  };
}
