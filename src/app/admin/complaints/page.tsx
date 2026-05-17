import { AdminComplaintsTable } from "@/components/admin/admin-complaints-table";
import { db } from "@/lib/db";

export default async function AdminComplaintsPage() {
  const complaints = await db.complaint.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      booking: { select: { reference: true } },
      raisedBy: { select: { fullName: true, email: true } },
    },
  });

  const rows = complaints.map((c) => ({
    id: c.id,
    bookingId: c.bookingId,
    bookingReference: c.booking.reference,
    complainantType: c.complainantType,
    subject: c.subject,
    description: c.description,
    priority: c.priority,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    raisedByName: c.raisedBy.fullName,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Complaints</h1>
      <p className="mt-2 text-slate-400">
        Customer and driver complaints for dispute resolution.
      </p>
      <div className="mt-6">
        <AdminComplaintsTable complaints={rows} />
      </div>
    </div>
  );
}
