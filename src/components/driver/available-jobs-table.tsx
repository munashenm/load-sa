"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { urgencyLabels, vehicleTypeLabels } from "@/lib/labels";
import { formatZAR } from "@/lib/sa-data";
import { VehicleIcon } from "@/lib/vehicle-icons";
import type { DeliveryUrgency, VehicleType } from "@/lib/types";

export type AvailableJob = {
  id: string;
  reference: string;
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
    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-slate-900/80 text-slate-400">
          <tr>
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
        <p className="py-12 text-center text-slate-500">
          No jobs matching your vehicle right now.
        </p>
      )}
    </div>
  );
}
