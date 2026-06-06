import { db } from "@/lib/db";
import { DisputesTable } from "@/components/admin/disputes-table";

export default async function AdminDisputesPage() {
  const disputes = await db.dispute.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      booking: { select: { id: true, reference: true } },
      raisedBy: { select: { fullName: true, role: true } },
    },
  });

  const rows = disputes.map((d) => ({
    id: d.id,
    reason: d.reason,
    status: d.status,
    resolution: d.resolution,
    createdAt: d.createdAt.toISOString(),
    booking: d.booking,
    raisedBy: d.raisedBy,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Disputes</h1>
      <p className="mt-2 text-slate-400">
        Review and resolve customer and driver disputes on bookings.
      </p>
      <div className="mt-8">
        <DisputesTable disputes={rows} />
      </div>
    </div>
  );
}
