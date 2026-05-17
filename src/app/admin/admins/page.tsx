import { StatusBadge } from "@/components/status-badge";
import { roleLabels } from "@/lib/labels";
import { db } from "@/lib/db";
import type { UserRole } from "@/lib/types";

export default async function AdminUsersPage() {
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Admin users</h1>
      <p className="mt-2 text-slate-400">Platform administrators with full console access.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-t border-slate-800/80">
                <td className="px-4 py-3 font-medium text-white">{a.fullName}</td>
                <td className="px-4 py-3 text-slate-400">{a.email}</td>
                <td className="px-4 py-3 text-slate-400">{a.phone}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={roleLabels[a.role as UserRole]} tone="amber" />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={a.accountStatus === "BLOCKED" ? "Blocked" : "Active"}
                    tone="green"
                  />
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(a.createdAt).toLocaleDateString("en-ZA")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {admins.length === 0 && (
          <p className="py-12 text-center text-slate-500">No admin users found.</p>
        )}
      </div>
    </div>
  );
}
