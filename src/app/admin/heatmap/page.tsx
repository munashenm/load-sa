import { db } from "@/lib/db";

export default async function AdminHeatmapPage() {
  const byCity = await db.booking.groupBy({
    by: ["pickupCity"],
    where: { status: { in: ["SEARCHING_DRIVER", "DRIVER_ASSIGNED", "IN_TRANSIT"] } },
    _count: true,
    orderBy: { _count: { pickupCity: "desc" } },
    take: 15,
  });

  const availableDrivers = await db.driverProfile.count({
    where: { isAvailable: true, verificationStatus: "APPROVED" },
  });

  const searching = await db.booking.count({
    where: { status: "SEARCHING_DRIVER" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Driver heatmap</h1>
      <p className="mt-2 text-slate-400">
        Demand hotspots and driver supply (MVP — province/city aggregates).
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Open jobs" value={String(searching)} />
        <Stat label="Drivers online" value={String(availableDrivers)} />
        <Stat
          label="Supply gap"
          value={searching > availableDrivers ? "Shortage" : "Balanced"}
        />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-white">High demand areas</h2>
      <ul className="mt-4 space-y-2">
        {byCity.map((c) => (
          <li
            key={c.pickupCity}
            className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3"
          >
            <span className="text-slate-300">{c.pickupCity}</span>
            <span
              className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300"
              style={{ opacity: Math.min(1, c._count / 10 + 0.3) }}
            >
              {c._count} active
            </span>
          </li>
        ))}
      </ul>
      {byCity.length === 0 && (
        <p className="mt-6 text-slate-500">No active demand clusters right now.</p>
      )}
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
