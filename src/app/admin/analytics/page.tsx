import Link from "next/link";
import {
  BarChart,
  DriverPerformanceTable,
  RevenueTrendChart,
} from "@/components/admin/analytics-charts";
import { StatCard } from "@/components/admin/stat-card";
import {
  getAdminAnalyticsSummary,
  getDriverPerformance,
  getOrdersByProvince,
  getOrdersByStatus,
  getRevenueTrend,
  getServiceTypeSplit,
} from "@/lib/admin-analytics";
import { bookingStatusLabels } from "@/lib/labels";
import { formatZAR } from "@/lib/sa-data";
import type { BookingStatus } from "@/lib/types";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Package,
  Truck,
  Users,
} from "lucide-react";

export default async function AdminAnalyticsPage() {
  const [summary, revenueTrend, byProvince, drivers, byStatus, byService] =
    await Promise.all([
      getAdminAnalyticsSummary(),
      getRevenueTrend(30),
      getOrdersByProvince(),
      getDriverPerformance(10),
      getOrdersByStatus(),
      getServiceTypeSplit(),
    ]);

  const provinceChartItems = byProvince.map((p) => ({
    province: p.province,
    count: p.count,
  }));

  const statusChartItems = byStatus.map((s) => ({
    status:
      bookingStatusLabels[s.status as BookingStatus] ??
      s.status.replace(/_/g, " "),
    count: s._count,
  }));

  const serviceChartItems = byService.map((s) => ({
    type: s.serviceType === "SHUTTLE" ? "Shuttle" : "Freight",
    count: s._count,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Analytics</h1>
      <p className="mt-2 text-slate-400">
        Revenue trends, provincial demand, and driver performance across FluxMove.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total orders"
          value={summary.totalOrders}
          href="/admin/bookings"
          icon={Package}
        />
        <StatCard
          label="Revenue"
          value={formatZAR(summary.revenue)}
          href="/admin/bookings"
          icon={Banknote}
          accent="emerald"
        />
        <StatCard
          label="Active drivers"
          value={summary.activeDrivers}
          href="/admin/drivers"
          icon={Truck}
          accent="blue"
        />
        <StatCard
          label="Active customers"
          value={summary.activeCustomers}
          href="/admin/customers"
          icon={Users}
        />
        <StatCard
          label="Pending verifications"
          value={summary.pendingVerifications}
          href="/admin/drivers"
          icon={Truck}
          accent="amber"
        />
        <StatCard
          label="Open complaints"
          value={summary.openComplaints}
          href="/admin/complaints"
          icon={AlertTriangle}
          accent="amber"
        />
        <StatCard
          label="Delivered today"
          value={summary.deliveriesCompletedToday}
          href="/admin/bookings"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          label="Platform fees"
          value={formatZAR(summary.platformFees)}
          href="/admin/commissions"
          icon={Banknote}
        />
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <div className="xl:col-span-2">
          <RevenueTrendChart points={revenueTrend} />
        </div>

        <BarChart
          title="Orders by province"
          subtitle="Pickup location — all 9 provinces"
          items={provinceChartItems}
          labelKey="province"
          valueKey="count"
          color="sky"
        />

        <BarChart
          title="Orders by status"
          subtitle="Current pipeline breakdown"
          items={statusChartItems}
          labelKey="status"
          valueKey="count"
          color="amber"
        />

        <BarChart
          title="Service type split"
          subtitle="Freight vs shuttle"
          items={serviceChartItems}
          labelKey="type"
          valueKey="count"
          color="emerald"
        />

        <div className="xl:col-span-2">
          <DriverPerformanceTable drivers={drivers} />
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-600">
        Need raw data?{" "}
        <Link href="/admin/reports" className="text-amber-400 hover:underline">
          Export reports
        </Link>{" "}
        or review{" "}
        <Link href="/admin/live-map" className="text-amber-400 hover:underline">
          live delivery map
        </Link>
        .
      </p>
    </div>
  );
}
