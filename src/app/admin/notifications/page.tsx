import { db } from "@/lib/db";

export default async function AdminNotificationsPage() {
  const notifications = await db.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { fullName: true, role: true } },
      booking: { select: { reference: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Notifications</h1>
      <p className="mt-2 text-slate-400">
        Delivery status alerts sent to customers.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Read</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id} className="border-t border-slate-800/80">
                <td className="px-4 py-3 text-slate-300">
                  {n.user.fullName} ({n.user.role})
                </td>
                <td className="px-4 py-3 font-mono text-amber-400">
                  {n.booking?.reference ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">{n.type}</td>
                <td className="px-4 py-3 text-white">{n.title}</td>
                <td className="px-4 py-3">{n.read ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(n.createdAt).toLocaleString("en-ZA")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {notifications.length === 0 && (
          <p className="py-12 text-center text-slate-500">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
