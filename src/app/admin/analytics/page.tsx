import { db } from "@/lib/db";
import { formatZAR } from "@/lib/sa-data";

export default async function AdminAnalyticsPage() {
  const byStatus = await db.booking.groupBy({
    by: ["status"],
    _count: true,
  });

  const byProvince = await db.booking.groupBy({
    by: ["pickupProvince"],
    _count: true,
    orderBy: { _count: { pickupProvince: "desc" } },
    take: 9,
  });

  const totals = await db.booking.aggregate({
    _count: true,
    _sum: { estimatedPrice: true, platformFee: true },
  });

  const delivered = await db.booking.count({ where: { status: "DELIVERED" } });
  const failed = await db.booking.count({ where: { status: "CANCELLED" } });

  const topDrivers = await db.driverProfile.findMany({
    orderBy: { rating: "desc" },
    take: 5,
    include: { user: { select: { fullName: true } } },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRevenue = await db.booking.aggregate({
    where: { createdAt: { gte: today }, paymentStatus: "PAID" },
    _sum: { finalPrice: true, estimatedPrice: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Analytics</h1>
      <p className="mt-2 text-slate-400">Platform performance across South Africa.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total orders" value={String(totals._count)} />
        <Stat
          label="Today's revenue"
          value={formatZAR(
            todayRevenue._sum.finalPrice ?? todayRevenue._sum.estimatedPrice ?? 0,
          )}
        />
        <Stat label="Delivered" value={String(delivered)} />
        <Stat label="Failed / cancelled" value={String(failed)} />
        <Stat
          label="Est. GMV"
          value={formatZAR(totals._sum.estimatedPrice ?? 0)}
        />
        <Stat
          label="Platform fees"
          value={formatZAR(totals._sum.platformFee ?? 0)}
        />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-white">Top drivers</h2>
      <ul className="mt-3 space-y-2">
        {topDrivers.map((d) => (
          <li
            key={d.id}
            className="flex justify-between rounded-lg border border-slate-800 px-4 py-2 text-sm"
          >
            <span className="text-slate-300">{d.user.fullName}</span>
            <span className="text-amber-400">{d.rating.toFixed(1)} ★</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white">Orders by status</h2>
      <ul className="mt-3 space-y-2">
        {byStatus.map((s) => (
          <li
            key={s.status}
            className="flex justify-between rounded-lg border border-slate-800 px-4 py-2 text-sm"
          >
            <span className="text-slate-300">{s.status}</span>
            <span className="text-white">{s._count}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white">Pickups by province</h2>
      <ul className="mt-3 space-y-2">
        {byProvince.map((p) => (
          <li
            key={p.pickupProvince}
            className="flex justify-between rounded-lg border border-slate-800 px-4 py-2 text-sm"
          >
            <span className="text-slate-300">{p.pickupProvince}</span>
            <span className="text-white">{p._count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
