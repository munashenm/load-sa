import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { verificationLabels, vehicleTypeLabels } from "@/lib/labels";
import { db } from "@/lib/db";
import type { VehicleType, VerificationStatus } from "@/lib/types";

export default async function AdminDriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await db.driverProfile.findUnique({
    where: { id },
    include: {
      user: true,
      vehicles: true,
      bookings: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!profile) notFound();

  return (
    <div>
      <Link href="/admin/drivers" className="text-sm text-amber-400 hover:underline">
        ← Back to drivers
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">{profile.user.fullName}</h1>
      <p className="text-slate-400">
        {profile.user.email} · {profile.user.phone}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge
          label={verificationLabels[profile.verificationStatus as VerificationStatus]}
          tone="amber"
        />
        <StatusBadge
          label={profile.accountStatus === "SUSPENDED" ? "Suspended" : "Active"}
          tone={profile.accountStatus === "SUSPENDED" ? "red" : "green"}
        />
      </div>
      {profile.vehicles[0] && (
        <p className="mt-4 text-sm text-slate-300">
          Vehicle: {vehicleTypeLabels[profile.vehicles[0].type as VehicleType]} ·{" "}
          {profile.vehicles[0].registration}
        </p>
      )}
      <h2 className="mt-8 text-lg font-semibold text-white">Recent jobs</h2>
      <ul className="mt-3 space-y-2 text-sm text-slate-400">
        {profile.bookings.map((b) => (
          <li key={b.id}>
            <Link href={`/admin/bookings/${b.id}`} className="text-amber-400 hover:underline">
              {b.reference}
            </Link>{" "}
            — {b.pickupCity} → {b.dropoffCity}
          </li>
        ))}
        {profile.bookings.length === 0 && <li>No jobs yet.</li>}
      </ul>
    </div>
  );
}
