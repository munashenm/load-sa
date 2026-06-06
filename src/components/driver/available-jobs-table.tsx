"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { serviceTypeLabels, shuttleTripLabels, urgencyLabels, vehicleTypeLabels } from "@/lib/labels";
import type { ServiceType, ShuttleTripType } from "@/lib/types";
import { formatZAR } from "@/lib/sa-data";
import { VehicleIcon } from "@/lib/vehicle-icons";
import type { DeliveryUrgency, VehicleType } from "@/lib/types";

export type AvailableJob = {
  id: string;
  reference: string;
  serviceType?: string;
  shuttleTripType?: string | null;
  pickupCity: string;
  pickupProvince: string;
  dropoffCity: string;
  dropoffProvince: string;
  distanceLabel: string;
  cargoDescription: string;
  vehicleType: string;
  estimatedPrice: number;
  urgency: string;
};

export function AvailableJobsTable({
  jobs,
  canAccept,
}: {
  jobs: AvailableJob[];
  canAccept: boolean;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function accept(id: string) {
    setLoadingId(id);
    await fetch(`/api/bookings/${id}/accept`, { method: "POST" });
    setLoadingId(null);
    router.refresh();
  }

  async function reject(id: string) {
    setLoadingId(id);
    await fetch(`/api/bookings/${id}/decline`, { method: "POST" });
    setLoadingId(null);
    router.refresh();
  }

  return (
    <>
      {/* Mobile card list — Uber/Lalamove style */}
      <ul className="space-y-3 lg:hidden">
        {jobs.map((j) => (
          <li
            key={j.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    j.serviceType === "SHUTTLE"
                      ? "bg-sky-500/20 text-sky-300"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {serviceTypeLabels[(j.serviceType as ServiceType) ?? "FREIGHT"]}
                </span>
                <p className="mt-2 font-mono text-sm text-amber-400">{j.reference}</p>
              </div>
              <p className="text-lg font-bold text-white">{formatZAR(j.estimatedPrice)}</p>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-slate-300">
                <span className="text-slate-500">From </span>
                {j.pickupCity}, {j.pickupProvince}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-500">To </span>
                {j.dropoffCity}, {j.dropoffProvince}
              </p>
              <p className="text-xs text-slate-500">
                {j.distanceLabel} · {urgencyLabels[j.urgency as DeliveryUrgency]} ·{" "}
                {vehicleTypeLabels[j.vehicleType as VehicleType]}
              </p>
              <p className="line-clamp-2 text-xs text-slate-400">{j.cargoDescription}</p>
            </div>
            {canAccept ? (
              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1"
                  disabled={loadingId === j.id}
                  onClick={() => accept(j.id)}
                >
                  Accept job
                </Button>
                <Button
                  variant="ghost"
                  disabled={loadingId === j.id}
                  onClick={() => reject(j.id)}
                >
                  Pass
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-500">Go online & verify to accept jobs</p>
            )}
          </li>
        ))}
        {jobs.length === 0 && (
          <p className="py-12 text-center text-slate-500">
            No jobs matching your vehicle right now.
          </p>
        )}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-800 lg:block">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-slate-900/80 text-slate-400">
          <tr>
            <th className="px-3 py-3">Type</th>
            <th className="px-3 py-3">Booking ID</th>
            <th className="px-3 py-3">Pickup</th>
            <th className="px-3 py-3">Drop-off</th>
            <th className="px-3 py-3">Distance</th>
            <th className="px-3 py-3">Goods</th>
            <th className="px-3 py-3">Vehicle</th>
            <th className="px-3 py-3">Price</th>
            <th className="px-3 py-3">Urgency</th>
            <th className="px-3 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id} className="border-t border-slate-800/80">
              <td className="px-3 py-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    j.serviceType === "SHUTTLE"
                      ? "bg-sky-500/20 text-sky-300"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {serviceTypeLabels[(j.serviceType as ServiceType) ?? "FREIGHT"]}
                </span>
              </td>
              <td className="px-3 py-3 font-mono text-amber-400">{j.reference}</td>
              <td className="px-3 py-3 text-slate-300">
                {j.pickupCity}, {j.pickupProvince}
              </td>
              <td className="px-3 py-3 text-slate-300">
                {j.dropoffCity}, {j.dropoffProvince}
              </td>
              <td className="px-3 py-3 text-slate-400">{j.distanceLabel}</td>
              <td className="max-w-[140px] px-3 py-3 text-xs text-slate-500 line-clamp-2">
                {j.cargoDescription}
              </td>
              <td className="px-3 py-3">
                <span className="flex items-center gap-1 text-slate-300">
                  <VehicleIcon type={j.vehicleType} className="h-4 w-4" />
                  {vehicleTypeLabels[j.vehicleType as VehicleType]}
                </span>
              </td>
              <td className="px-3 py-3 font-medium text-white">
                {formatZAR(j.estimatedPrice)}
              </td>
              <td className="px-3 py-3 text-slate-400">
                {urgencyLabels[j.urgency as DeliveryUrgency]}
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  {canAccept ? (
                    <>
                      <Button
                        className="!py-1 !text-xs"
                        disabled={loadingId === j.id}
                        onClick={() => accept(j.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        className="!py-1 !text-xs"
                        disabled={loadingId === j.id}
                        onClick={() => reject(j.id)}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">Go online & verify</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {jobs.length === 0 && (
        <p className="hidden py-12 text-center text-slate-500 lg:block">
          No jobs matching your vehicle right now.
        </p>
      )}
      </div>
    </>
  );
}
