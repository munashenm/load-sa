import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  Users,
  Banknote,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { getAdminDashboardStats } from "@/lib/admin-stats";
import { formatZAR } from "@/lib/sa-data";

export default async function AdminOverviewPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard overview</h1>
      <p className="mt-2 text-slate-400">
        Load SA marketplace — bookings, drivers, and revenue at a glance.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total bookings"
          value={stats.totalBookings}
          href="/admin/bookings"
          icon={Package}
        />
        <StatCard
          label="Pending bookings"
          value={stats.pendingBookings}
          href="/admin/bookings"
          icon={Clock}
          accent="amber"
        />
        <StatCard
          label="Active deliveries"
          value={stats.activeDeliveries}
          href="/admin/bookings"
          icon={Truck}
          accent="blue"
        />
        <StatCard
          label="Completed deliveries"
          value={stats.completedDeliveries}
          href="/admin/bookings"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          label="Total drivers"
          value={stats.totalDrivers}
          href="/admin/drivers"
          icon={Truck}
        />
        <StatCard
          label="Total customers"
          value={stats.totalCustomers}
          href="/admin/customers"
          icon={Users}
        />
        <StatCard
          label="Revenue"
          value={formatZAR(stats.revenue)}
          href="/admin/bookings"
          icon={Banknote}
          accent="emerald"
        />
      </div>
    </div>
  );
}
