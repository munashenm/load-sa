import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Percent,
  Truck,
  Users,
  XCircle,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { getAdminDashboardStats, getRecentBookings } from "@/lib/admin-stats";
import { bookingStatusLabels } from "@/lib/labels";
import { formatZAR } from "@/lib/sa-data";
import type { BookingStatus } from "@/lib/types";

const quickActions = [
  { href: "/admin/bookings", label: "Manage bookings" },
  { href: "/admin/live-map", label: "Live delivery map" },
  { href: "/admin/drivers", label: "Review drivers" },
  { href: "/admin/business", label: "Business accounts" },
  { href: "/admin/pricing", label: "Pricing rules" },
  { href: "/admin/reports", label: "Export reports" },
];

export default async function AdminOverviewPage() {
  const [stats, recent] = await Promise.all([
    getAdminDashboardStats(),
    getRecentBookings(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform dashboard</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            FluxMove operations — bookings, deliveries, revenue, and fleet at a glance.
          </p>
        </div>
        <Link
          href="/admin/reports"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/20"
        >
          Export reports
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Deliveries
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total bookings"
            value={stats.totalBookings}
            href="/admin/bookings"
            icon={Package}
          />
          <StatCard
            label="Active deliveries"
            value={stats.activeDeliveries}
            href="/admin/live-map"
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
            label="Cancelled deliveries"
            value={stats.cancelledDeliveries}
            href="/admin/bookings"
            icon={XCircle}
            accent="red"
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Finance
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Total revenue"
            value={formatZAR(stats.revenue)}
            href="/admin/analytics"
            icon={Banknote}
            accent="emerald"
          />
          <StatCard
            label="Driver earnings"
            value={formatZAR(stats.driverEarnings)}
            href="/admin/payouts"
            icon={Truck}
            accent="blue"
          />
          <StatCard
            label="FluxMove commission"
            value={formatZAR(stats.platformCommission)}
            href="/admin/commissions"
            icon={Percent}
            accent="amber"
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          People & support
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active drivers"
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
            label="Pending verifications"
            value={stats.pendingVerifications}
            href="/admin/drivers"
            icon={Clock}
            accent="amber"
          />
          <StatCard
            label="Open complaints"
            value={stats.openComplaints}
            href="/admin/complaints"
            icon={AlertTriangle}
            accent="amber"
          />
          <StatCard
            label="Open disputes"
            value={stats.openDisputes}
            href="/admin/disputes"
            icon={AlertTriangle}
            accent="red"
          />
          <StatCard
            label="Delivered today"
            value={stats.deliveriesCompletedToday}
            href="/admin/analytics"
            icon={CheckCircle2}
            accent="emerald"
          />
          <StatCard
            label="Pending bookings"
            value={stats.pendingBookings}
            href="/admin/bookings"
            icon={Clock}
            accent="amber"
          />
          <StatCard
            label="Live map"
            value={stats.activeDeliveries > 0 ? "View fleet" : "No active"}
            href="/admin/live-map"
            icon={MapPin}
            accent="blue"
          />
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-amber-400 hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recent.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800/80 px-4 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="font-mono text-amber-400 hover:underline"
                  >
                    {b.reference}
                  </Link>
                  <p className="text-slate-400">
                    {b.pickupCity} → {b.dropoffCity} · {b.customer.fullName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white">{formatZAR(b.estimatedPrice)}</p>
                  <p className="text-xs text-slate-500">
                    {bookingStatusLabels[b.status as BookingStatus] ?? b.status}
                  </p>
                </div>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="py-6 text-center text-slate-500">No bookings yet.</li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="font-semibold text-white">Quick actions</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {quickActions.map((action) => (
              <li key={action.href}>
                <Link
                  href={action.href}
                  className="block rounded-xl border border-slate-800 px-4 py-3 text-sm text-slate-300 transition hover:border-amber-500/30 hover:bg-slate-800/50 hover:text-white"
                >
                  {action.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Building2 className="h-4 w-4 text-amber-500" />
              Business portal, pricing, and driver verification are managed from the sidebar.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
