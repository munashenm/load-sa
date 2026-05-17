import { db } from "@/lib/db";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminDisputesPage() {
  const disputes = await db.dispute.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      booking: { select: { reference: true } },
      raisedBy: { select: { fullName: true, role: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Disputes</h1>
      <p className="mt-2 text-slate-400">Customer and driver dispute resolution.</p>

      <ul className="mt-6 space-y-3">
        {disputes.map((d) => (
          <li
            key={d.id}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-sm text-amber-400">
                {d.booking.reference}
              </span>
              <StatusBadge
                label={d.status}
                tone={d.status === "OPEN" ? "amber" : "green"}
              />
            </div>
            <p className="mt-2 text-sm text-white">{d.reason}</p>
            <p className="mt-1 text-xs text-slate-500">
              Raised by {d.raisedBy.fullName} ({d.raisedBy.role})
            </p>
          </li>
        ))}
        {disputes.length === 0 && (
          <p className="text-slate-500">No disputes filed.</p>
        )}
      </ul>
    </div>
  );
}
