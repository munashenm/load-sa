import { db } from "@/lib/db";
import { roleLabels } from "@/lib/labels";
import { StatusBadge } from "@/components/status-badge";
import type { UserRole } from "@/lib/types";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      driverProfile: { select: { verificationStatus: true, isAvailable: true } },
      _count: { select: { bookingsAsCustomer: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Users</h1>
      <p className="mt-2 text-slate-400">Customers, drivers, and admins on the platform.</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Role</th>
              <th className="py-3 pr-4">Driver status</th>
              <th className="py-3">Bookings</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-800/60">
                <td className="py-3 pr-4 text-white">{u.fullName}</td>
                <td className="py-3 pr-4 text-slate-400">{u.email}</td>
                <td className="py-3 pr-4">
                  <StatusBadge label={roleLabels[u.role as UserRole]} tone="blue" />
                </td>
                <td className="py-3 pr-4 text-slate-400">
                  {u.driverProfile
                    ? `${u.driverProfile.verificationStatus}${u.driverProfile.isAvailable ? " · online" : ""}`
                    : "—"}
                </td>
                <td className="py-3 text-slate-300">{u._count.bookingsAsCustomer}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="py-8 text-center text-slate-500">No users yet.</p>
        )}
      </div>
    </div>
  );
}
