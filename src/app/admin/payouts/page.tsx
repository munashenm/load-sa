import { db } from "@/lib/db";
import { formatZAR } from "@/lib/sa-data";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminPayoutsPage() {
  const payouts = await db.payout.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      driverProfile: { include: { user: { select: { fullName: true } } } },
    },
  });

  const pendingDriverEarnings = await db.booking.aggregate({
    where: {
      status: "DELIVERED",
      paymentStatus: "PAID",
      driverEarnings: { not: null },
    },
    _sum: { driverEarnings: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Payouts</h1>
      <p className="mt-2 text-slate-400">
        Driver earnings awaiting bank transfer (manual / PayFast Payouts later).
      </p>

      <div className="mt-6 rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-5">
        <p className="text-sm text-emerald-300/80">Delivered & paid — driver pool</p>
        <p className="text-2xl font-bold text-emerald-300">
          {formatZAR(pendingDriverEarnings._sum.driverEarnings ?? 0)}
        </p>
      </div>

      <ul className="mt-8 space-y-3">
        {payouts.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 px-4 py-3"
          >
            <div>
              <p className="font-medium text-white">{p.driverProfile.user.fullName}</p>
              <p className="text-xs text-slate-500">{p.reference ?? p.id.slice(0, 8)}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge
                label={p.status}
                tone={p.status === "PAID" ? "green" : "amber"}
              />
              <span className="font-semibold text-white">{formatZAR(p.amount)}</span>
            </div>
          </li>
        ))}
        {payouts.length === 0 && (
          <p className="text-slate-500">No payout batches yet. Create from driver earnings.</p>
        )}
      </ul>
    </div>
  );
}
