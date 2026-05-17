"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatZAR } from "@/lib/sa-data";
import { VehicleIcon } from "@/lib/vehicle-icons";
import {
  bookingStatusLabels,
  cargoSizeLabels,
  urgencyLabels,
  vehicleTypeLabels,
} from "@/lib/labels";
import type { BookingStatus, CargoSize, DeliveryUrgency, VehicleType } from "@/lib/types";

type Job = {
  id: string;
  reference: string;
  pickupAddress: string;
  pickupCity: string;
  pickupProvince: string;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffProvince: string;
  vehicleType: VehicleType;
  cargoDescription: string;
  cargoSize?: string | null;
  cargoImageUrl?: string | null;
  weightKg?: number | null;
  urgency: string;
  estimatedPrice: number;
  status: BookingStatus;
  scheduledAt?: string | Date | null;
};

export function DriverJobs({
  openJobs,
  myJobs,
  canAccept,
}: {
  openJobs: Job[];
  myJobs: Job[];
  canAccept: boolean;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function acceptJob(id: string) {
    setLoadingId(id);
    const res = await fetch(`/api/bookings/${id}/accept`, { method: "POST" });
    setLoadingId(null);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Available jobs</h2>
        {openJobs.length === 0 ? (
          <p className="text-slate-400">
            No open jobs right now. Toggle availability to get notified when new
            requests arrive.
          </p>
        ) : (
          <ul className="space-y-3">
            {openJobs.map((job) => (
              <li
                key={job.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <JobCard
                  job={job}
                  canAccept={canAccept}
                  loading={loadingId === job.id}
                  onAccept={() => acceptJob(job.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Your jobs</h2>
        {myJobs.length === 0 ? (
          <p className="text-slate-400">No assigned jobs yet.</p>
        ) : (
          <ul className="space-y-3">
            {myJobs.map((job) => (
              <li
                key={job.id}
                className="rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-4"
              >
                <p className="font-mono text-sm text-emerald-400">{job.reference}</p>
                <p className="mt-1 font-medium text-white">
                  {job.pickupCity} → {job.dropoffCity}
                </p>
                <p className="text-sm text-slate-400">
                  {bookingStatusLabels[job.status]} · {formatZAR(job.estimatedPrice)}
                </p>
                <Link
                  href={`/track/${job.id}`}
                  className="mt-2 inline-block text-xs text-amber-400 hover:underline"
                >
                  Open job →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function JobCard({
  job,
  canAccept,
  loading,
  onAccept,
}: {
  job: Job;
  canAccept: boolean;
  loading: boolean;
  onAccept: () => void;
}) {
  const urgency = (job.urgency ?? "STANDARD") as DeliveryUrgency;

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm text-amber-400">{job.reference}</p>
        <p className="mt-1 font-medium text-white">
          {job.pickupCity}, {job.pickupProvince} → {job.dropoffCity},{" "}
          {job.dropoffProvince}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {job.pickupAddress} → {job.dropoffAddress}
        </p>
        <p className="mt-2 text-sm text-slate-400">{job.cargoDescription}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <VehicleIcon type={job.vehicleType} className="h-3.5 w-3.5" />
          {vehicleTypeLabels[job.vehicleType]} · {urgencyLabels[urgency]}
          {job.cargoSize && ` · ${cargoSizeLabels[job.cargoSize as CargoSize]}`}
          {job.weightKg != null && ` · ${job.weightKg} kg`}
        </p>
        {job.scheduledAt && (
          <p className="mt-1 text-xs text-amber-200/80">
            Pickup: {new Date(job.scheduledAt).toLocaleString("en-ZA")}
          </p>
        )}
        {job.cargoImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.cargoImageUrl}
            alt="Cargo"
            className="mt-2 h-16 w-20 rounded border border-slate-700 object-cover"
          />
        )}
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-amber-300">{formatZAR(job.estimatedPrice)}</p>
        {canAccept ? (
          <Button className="mt-2 !py-2 text-xs" disabled={loading} onClick={onAccept}>
            {loading ? "Accepting…" : "Accept job"}
          </Button>
        ) : (
          <p className="mt-2 text-xs text-slate-500">Verify to accept</p>
        )}
      </div>
    </div>
  );
}
