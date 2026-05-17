import { DriversTable, type AdminDriverRow } from "@/components/admin/drivers-table";
import { db } from "@/lib/db";

export default async function AdminDriversPage() {
  const profiles = await db.driverProfile.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { fullName: true, phone: true, email: true } },
      vehicles: { take: 1 },
      _count: { select: { bookings: true } },
    },
  });

  const rows: AdminDriverRow[] = profiles.map((p) => ({
    id: p.id,
    verificationStatus: p.verificationStatus,
    accountStatus: p.accountStatus,
    isAvailable: p.isAvailable,
    user: p.user,
    vehicleType: p.vehicles[0]?.type ?? null,
    jobCount: p._count.bookings,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Drivers</h1>
      <p className="mt-2 text-slate-400">
        Approve, reject, suspend, or activate drivers on the platform.
      </p>
      <div className="mt-6">
        <DriversTable drivers={rows} />
      </div>
    </div>
  );
}
