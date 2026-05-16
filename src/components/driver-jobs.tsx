"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatZAR } from "@/lib/sa-data";
import { bookingStatusLabels, vehicleTypeLabels } from "@/lib/labels";
import type { BookingStatus, VehicleType } from "@/lib/types";

type Job = {
  id: string;
  reference: string;
  pickupCity: string;
  pickupProvince: string;
  dropoffCity: string;
  dropoffProvince: string;
  vehicleType: VehicleType;
  cargoDescription: string;
  estimatedPrice: number;
  status: BookingStatus;
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
        <h2 className="mb-4 text-lg font-semibold text-white">Available nationwide</h2>
        {openJobs.length === 0 ? (
          <p className="text-slate-400">No open jobs right now. Toggle availability to get notified.</p>
        ) : (
          <ul className="space-y-3">
            {openJobs.map((job) => (
              <li
                key={job.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-amber-400">{job.reference}</p>
                    <p className="mt-1 font-medium text-white">
                      {job.pickupCity}, {job.pickupProvince} → {job.dropoffCity},{" "}
                      {job.dropoffProvince}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {vehicleTypeLabels[job.vehicleType]} · {job.cargoDescription}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-300">
                      {formatZAR(job.estimatedPrice)}
                    </p>
                    {canAccept ? (
                      <Button
                        className="mt-2 !py-2 text-xs"
                        disabled={loadingId === job.id}
                        onClick={() => acceptJob(job.id)}
                      >
                        {loadingId === job.id ? "Accepting…" : "Accept job"}
                      </Button>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">Verify to accept</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Your active jobs</h2>
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
                <p className="mt-1 text-white">
                  {job.pickupCity} → {job.dropoffCity}
                </p>
                <p className="text-sm text-slate-400">
                  {bookingStatusLabels[job.status]} · {formatZAR(job.estimatedPrice)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
