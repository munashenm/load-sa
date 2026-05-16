import Link from "next/link";
import { redirect } from "next/navigation";
import { AvailabilityToggle } from "@/components/availability-toggle";
import { DriverJobs } from "@/components/driver-jobs";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { verificationLabels } from "@/lib/labels";
import type { VerificationStatus } from "@/lib/types";

export default async function DriverPage() {
  const user = await requireUser(["DRIVER"]);

  const profile = await db.driverProfile.findUnique({
    where: { userId: user.id },
    include: { vehicles: true },
  });

  if (!profile) {
    redirect("/register");
  }

  const status = profile.verificationStatus as VerificationStatus;
  const toneMap: Record<
    VerificationStatus,
    "amber" | "green" | "red" | "blue" | "slate"
  > = {
    PENDING: "slate",
    UNDER_REVIEW: "amber",
    APPROVED: "green",
    REJECTED: "red",
  };

  const openJobs = await db.booking.findMany({
    where: { status: "SEARCHING_DRIVER" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const myJobs = await db.booking.findMany({
    where: { driverId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const needsVerification =
    status === "PENDING" ||
    status === "REJECTED" ||
    !profile.idNumber;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Driver hub</h1>
          <p className="mt-1 text-slate-400">Hi {user.fullName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge
            label={verificationLabels[status]}
            tone={toneMap[status]}
          />
          {status === "APPROVED" && (
            <AvailabilityToggle initial={profile.isAvailable} />
          )}
        </div>
      </div>

      {needsVerification && (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <p className="font-medium text-amber-200">Complete verification</p>
          <p className="mt-1 text-sm text-amber-200/70">
            Submit your ID, licence and vehicle details before accepting paid jobs.
          </p>
          <Link
            href="/driver/verify"
            className="mt-3 inline-block text-sm font-semibold text-amber-400 hover:underline"
          >
            Start verification →
          </Link>
        </div>
      )}

      {status === "UNDER_REVIEW" && (
        <p className="mt-6 rounded-xl bg-slate-800/80 px-4 py-3 text-sm text-slate-300">
          Your documents are being reviewed. You will be able to accept jobs once approved.
        </p>
      )}

      {status === "REJECTED" && profile.reviewNotes && (
        <p className="mt-6 rounded-xl bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {profile.reviewNotes}
        </p>
      )}

      <div className="mt-10">
        <DriverJobs
          openJobs={openJobs as Parameters<typeof DriverJobs>[0]["openJobs"]}
          myJobs={myJobs as Parameters<typeof DriverJobs>[0]["myJobs"]}
          canAccept={status === "APPROVED"}
        />
      </div>
    </div>
  );
}
