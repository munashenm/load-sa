import { db } from "@/lib/db";
import { getAdminAnalyticsSummary } from "@/lib/admin-analytics";

export async function getAdminDashboardStats() {
  const summary = await getAdminAnalyticsSummary();

  const [
    totalBookingsAll,
    pendingBookings,
    activeDeliveries,
    completedDeliveries,
    cancelledDeliveries,
    driverEarningsAgg,
    openDisputes,
  ] = await Promise.all([
    db.booking.count(),
    db.booking.count({ where: { status: "SEARCHING_DRIVER" } }),
    db.booking.count({
      where: {
        status: {
          in: [
            "DRIVER_ASSIGNED",
            "EN_ROUTE_PICKUP",
            "PICKED_UP",
            "IN_TRANSIT",
            "NEAR_DESTINATION",
          ],
        },
      },
    }),
    db.booking.count({ where: { status: "DELIVERED" } }),
    db.booking.count({ where: { status: "CANCELLED" } }),
    db.booking.aggregate({
      where: { paymentStatus: { in: ["PAID", "INVOICED"] } },
      _sum: { driverEarnings: true },
    }),
    db.dispute.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
  ]);

  return {
    totalBookings: totalBookingsAll,
    pendingBookings,
    activeDeliveries,
    completedDeliveries,
    cancelledDeliveries,
    totalDrivers: summary.activeDrivers,
    totalCustomers: summary.activeCustomers,
    revenue: summary.revenue,
    driverEarnings: driverEarningsAgg._sum.driverEarnings ?? 0,
    platformCommission: summary.platformFees,
    pendingVerifications: summary.pendingVerifications,
    openComplaints: summary.openComplaints,
    openDisputes,
    deliveriesCompletedToday: summary.deliveriesCompletedToday,
  };
}

export async function getRecentBookings(limit = 8) {
  return db.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      reference: true,
      status: true,
      pickupCity: true,
      dropoffCity: true,
      estimatedPrice: true,
      createdAt: true,
      customer: { select: { fullName: true } },
    },
  });
}
