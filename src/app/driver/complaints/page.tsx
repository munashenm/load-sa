import { ComplaintForm } from "@/components/complaints/complaint-form";
import { requireUser } from "@/lib/auth";
import { getDriverProfileForUser } from "@/lib/driver-portal";
import { db } from "@/lib/db";
import {
  complaintPriorityLabels,
  complaintStatusLabels,
} from "@/lib/labels";

export default async function DriverComplaintsPage() {
  const user = await requireUser(["DRIVER"]);
  const profile = await getDriverProfileForUser(user.id);
  if (!profile) return null;

  const complaints = await db.complaint.findMany({
    where: { raisedById: user.id },
    orderBy: { createdAt: "desc" },
    include: { booking: { select: { reference: true } } },
  });

  const recentBookings = await db.booking.findMany({
    where: { driverId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, reference: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Complaints</h1>
      <p className="mt-2 text-slate-400">
        Log issues directly to admin and track resolution progress.
      </p>

      <section className="mt-8 max-w-lg">
        <h2 className="text-lg font-semibold text-white">New complaint</h2>
        {recentBookings[0] ? (
          <div className="mt-4">
            <ComplaintForm
              bookingId={recentBookings[0].id}
              bookingReference={recentBookings[0].reference}
            />
            <p className="mt-2 text-xs text-slate-500">
              Default booking: {recentBookings[0].reference}. Use delivery page for a
              specific booking.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Accept a delivery first to attach a booking ID.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">Your complaints</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-4 py-3">Booking ID</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id} className="border-t border-slate-800/80">
                  <td className="px-4 py-3 font-mono text-amber-400">
                    {c.booking?.reference ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-white">{c.subject}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {complaintPriorityLabels[c.priority] ?? c.priority}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {complaintStatusLabels[c.status] ?? c.status}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(c.updatedAt).toLocaleDateString("en-ZA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {complaints.length === 0 && (
            <p className="py-8 text-center text-slate-500">No complaints filed.</p>
          )}
        </div>
      </section>
    </div>
  );
}
