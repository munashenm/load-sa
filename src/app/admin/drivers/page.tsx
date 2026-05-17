import { db } from "@/lib/db";
import { AdminDriverActions } from "@/components/admin-driver-actions";

export default async function AdminDriversPage() {
  const pending = await db.driverProfile.findMany({
    where: { verificationStatus: "UNDER_REVIEW" },
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
      vehicles: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const approved = await db.driverProfile.count({
    where: { verificationStatus: "APPROVED" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Drivers</h1>
      <p className="mt-2 text-slate-400">
        {pending.length} pending verification · {approved} approved
      </p>

      <ul className="mt-8 space-y-4">
        {pending.map((p) => (
          <li
            key={p.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <p className="font-semibold text-white">{p.user.fullName}</p>
            <p className="text-sm text-slate-400">
              {p.user.email} · {p.user.phone}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {p.city}, {p.province} · ID {p.idNumber}
            </p>
            {p.vehicles[0] && (
              <p className="mt-1 text-sm text-slate-500">
                {p.vehicles[0].registration} ({p.vehicles[0].type})
              </p>
            )}
            <AdminDriverActions profileId={p.id} />
          </li>
        ))}
        {pending.length === 0 && (
          <p className="text-slate-500">No drivers awaiting review.</p>
        )}
      </ul>
    </div>
  );
}
