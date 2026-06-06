import { redirect } from "next/navigation";
import Link from "next/link";
import { BusinessShell } from "@/components/business/business-shell";
import { requireUser } from "@/lib/auth";
import {
  getBusinessAccessForUser,
  getBusinessDashboardStats,
} from "@/lib/business-portal";
import { formatZAR } from "@/lib/sa-data";
import { db } from "@/lib/db";

export default async function BusinessDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["CUSTOMER"], "/business");
  const { id } = await params;
  const access = await getBusinessAccessForUser(user.id, id);
  if (!access) redirect("/business/setup");

  const stats = await getBusinessDashboardStats(id);
  const recent = await db.booking.findMany({
    where: { businessAccountId: id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { customer: { select: { fullName: true } } },
  });

  return (
    <BusinessShell businessId={id} businessName={access.business.name}>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-slate-400">{access.business.name}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total deliveries" value={String(stats.totalBookings)} />
        <StatCard label="This month" value={String(stats.bookingsThisMonth)} />
        <StatCard label="Active now" value={String(stats.activeDeliveries)} accent="text-sky-400" />
        <StatCard
          label="Spend this month"
          value={formatZAR(stats.spendThisMonth)}
          accent="text-amber-400"
        />
        <StatCard label="Scheduled" value={String(stats.scheduledDeliveries)} />
        <StatCard label="Booked today" value={String(stats.bookingsToday)} />
        {access.business.monthlyInvoicing && (
          <StatCard
            label="Awaiting invoice"
            value={String(stats.pendingInvoiceBookings)}
          />
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/business/${id}/book`}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          New booking
        </Link>
        <Link
          href={`/business/${id}/bulk`}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:text-white"
        >
          Bulk upload
        </Link>
        <a
          href={`/api/business/${id}/export`}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:text-white"
        >
          Export CSV
        </a>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">Recent deliveries</h2>
        <ul className="mt-4 divide-y divide-slate-800 rounded-2xl border border-slate-800">
          {recent.length === 0 ? (
            <li className="p-4 text-sm text-slate-500">No bookings yet.</li>
          ) : (
            recent.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-mono text-sm text-amber-400">{b.reference}</p>
                  <p className="text-sm text-slate-400">
                    {b.pickupCity} → {b.dropoffCity} · {b.customer.fullName}
                  </p>
                </div>
                <span className="text-sm text-slate-500">{b.status.replace(/_/g, " ")}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </BusinessShell>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ?? "text-white"}`}>{value}</p>
    </div>
  );
}
