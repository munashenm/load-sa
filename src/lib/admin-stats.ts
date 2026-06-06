import { db } from "@/lib/db";
import { getAdminAnalyticsSummary } from "@/lib/admin-analytics";

export async function getAdminDashboardStats() {
  const summary = await getAdminAnalyticsSummary();

  const [pendingBookings, activeDeliveries, completedDeliveries] = await Promise.all([
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
  ]);

  return {
    totalBookings: summary.totalOrders,
    pendingBookings,
    activeDeliveries,
    completedDeliveries,
    totalDrivers: summary.activeDrivers,
    totalCustomers: summary.activeCustomers,
    revenue: summary.revenue,
    pendingVerifications: summary.pendingVerifications,
    openComplaints: summary.openComplaints,
    deliveriesCompletedToday: summary.deliveriesCompletedToday,
  };
}
