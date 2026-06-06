"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { verificationLabels, vehicleTypeLabels } from "@/lib/labels";
import type { VehicleType, VerificationStatus } from "@/lib/types";

export type AdminDriverRow = {
  id: string;
  verificationStatus: string;
  accountStatus: string;
  isAvailable: boolean;
  user: { fullName: string; phone: string; email: string };
  vehicleType: string | null;
  jobCount: number;
};

export function DriversTable({ drivers }: { drivers: AdminDriverRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function act(id: string, action: string) {
    setLoading(`${id}-${action}`);
    await fetch(`/api/admin/drivers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-slate-900/80 text-slate-400">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Vehicle</th>
            <th className="px-4 py-3">Verification</th>
            <th className="px-4 py-3">Availability</th>
            <th className="px-4 py-3">Total jobs</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => {
            const busy = loading?.startsWith(d.id);
            return (
              <tr key={d.id} className="border-t border-slate-800/80">
                <td className="px-4 py-3 font-medium text-white">{d.user.fullName}</td>
                <td className="px-4 py-3 text-slate-400">{d.user.phone}</td>
                <td className="px-4 py-3 text-slate-400">
                  {d.vehicleType
                    ? vehicleTypeLabels[d.vehicleType as VehicleType]
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={verificationLabels[d.verificationStatus as VerificationStatus]}
                    tone={
                      d.verificationStatus === "APPROVED"
                        ? "green"
                        : d.verificationStatus === "REJECTED"
                          ? "red"
                          : "amber"
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  {d.accountStatus === "SUSPENDED" ? (
                    <StatusBadge label="Suspended" tone="red" />
                  ) : d.isAvailable ? (
                    <StatusBadge label="Online" tone="green" />
                  ) : (
                    <StatusBadge label="Offline" tone="slate" />
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">{d.jobCount}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {d.verificationStatus !== "APPROVED" && (
                      <Button
                        variant="secondary"
                        className="!py-1 !text-xs"
                        disabled={busy}
                        onClick={() => act(d.id, "approve")}
                      >
                        Approve
                      </Button>
                    )}
                    {d.verificationStatus !== "REJECTED" && (
                      <Button
                        variant="ghost"
                        className="!py-1 !text-xs"
                        disabled={busy}
                        onClick={() => act(d.id, "reject")}
                      >
                        Reject
                      </Button>
                    )}
                    {d.accountStatus === "ACTIVE" ? (
                      <Button
                        variant="danger"
                        className="!py-1 !text-xs"
                        disabled={busy}
                        onClick={() => act(d.id, "suspend")}
                      >
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="!py-1 !text-xs"
                        disabled={busy}
                        onClick={() => act(d.id, "activate")}
                      >
                        Activate
                      </Button>
                    )}
        <Link href={`/admin/drivers/${d.id}`}>
                      <Button variant="ghost" className="!py-1 !text-xs">
                        Review docs
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {drivers.length === 0 && (
        <p className="py-12 text-center text-slate-500">No drivers yet.</p>
      )}
    </div>
  );
}
