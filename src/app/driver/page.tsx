import Link from "next/link";
import { DriverOnlineToggle } from "@/components/driver/driver-online-toggle";
import { requireUser } from "@/lib/auth";
import {
  canGoOnline,
  getAvailableJobsForDriver,
  getDriverEarningsStats,
  getDriverProfileForUser,
  primaryVehicleType,
  verificationDisplay,
} from "@/lib/driver-portal";
import { db } from "@/lib/db";
import { formatZAR } from "@/lib/sa-data";
import type { VerificationStatus } from "@/lib/types";

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string;
  href?: string;
  accent?: string;
}) {
  const inner = (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ?? "text-white"}`}>{value}</p>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block transition hover:border-emerald-500/30">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default async function DriverOverviewPage() {
  const user = await requireUser(["DRIVER"]);
  const profile = await getDriverProfileForUser(user.id);
  if (!profile) return null;

  const vType = primaryVehicleType(profile.vehicles);
  const availableJobs = await getAvailableJobsForDriver(profile.id, vType, profile);
  const earnings = await getDriverEarningsStats(profile.id);

  const activeCount = await db.booking.count({
    where: {
      driverId: profile.id,
      status: { notIn: ["DELIVERED", "CANCELLED"] },
    },
  });

  const suspended = profile.accountStatus === "SUSPENDED";
  const verified = profile.verificationStatus === "APPROVED";

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Driver overview</h1>
          <p className="mt-1 text-slate-400">Welcome back, {user.fullName}</p>
          <p className="mt-2 text-sm text-slate-500">
            Verification:{" "}
            <span className="text-amber-400">
              {verificationDisplay(profile.verificationStatus as VerificationStatus)}
            </span>
          </p>
        </div>
        <DriverOnlineToggle
          initial={profile.isAvailable}
          canToggle={canGoOnline(profile)}
          suspended={suspended}
        />
      </div>

      {!verified && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-200">
            Unverified drivers cannot accept jobs. Complete{" "}
            <Link href="/driver/profile" className="font-semibold text-amber-400 underline">
              profile & verification
            </Link>
            .
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Earnings today"
          value={formatZAR(earnings.earningsToday)}
          href="/driver/earnings"
          accent="text-emerald-400"
        />
        <StatCard
          label="Earnings this week"
          value={formatZAR(earnings.earningsThisWeek)}
          href="/driver/earnings"
        />
        <StatCard
          label="Earnings this month"
          value={formatZAR(earnings.earningsThisMonth)}
          href="/driver/earnings"
        />
        <StatCard
          label="Available jobs"
          value={String(availableJobs.length)}
          href="/driver/jobs"
          accent="text-amber-400"
        />
        <StatCard
          label="Active deliveries"
          value={String(activeCount)}
          href="/driver/deliveries"
        />
        <StatCard
          label="Completed jobs"
          value={String(earnings.completedCount)}
        />
        <StatCard
          label="Total earnings"
          value={formatZAR(earnings.totalEarnings)}
          href="/driver/earnings"
        />
        <StatCard
          label="Pending payouts"
          value={formatZAR(earnings.pendingPayout)}
          href="/driver/earnings"
        />
        <StatCard
          label="Driver rating"
          value={`${profile.rating.toFixed(1)} ★`}
        />
      </div>

      {activeCount > 0 && (
        <section className="mt-10">
          <Link
            href="/driver/deliveries"
            className="text-sm font-semibold text-emerald-400 hover:underline"
          >
            View active deliveries →
          </Link>
        </section>
      )}

      <p className="mt-8 text-xs text-slate-600">
        From tender documents and small parcels to furniture, business equipment,
        vehicles, and heavy assets — match jobs to your approved vehicle type only.
      </p>
    </div>
  );
}
