"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";

export type AdminDisputeRow = {
  id: string;
  reason: string;
  status: string;
  resolution: string | null;
  createdAt: string;
  booking: { id: string; reference: string };
  raisedBy: { fullName: string; role: string };
};

export function DisputesTable({ disputes }: { disputes: AdminDisputeRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [resolution, setResolution] = useState<Record<string, string>>({});

  async function resolve(id: string, status: "RESOLVED" | "CLOSED" | "IN_REVIEW") {
    setLoading(id);
    await fetch(`/api/admin/disputes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        resolution: resolution[id] || undefined,
      }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="bg-slate-900/80 text-slate-400">
          <tr>
            <th className="px-4 py-3">Booking</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Raised by</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {disputes.map((d) => (
            <tr key={d.id} className="border-t border-slate-800/80 align-top">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/bookings/${d.booking.id}`}
                  className="font-mono text-amber-400 hover:underline"
                >
                  {d.booking.reference}
                </Link>
              </td>
              <td className="max-w-xs px-4 py-3 text-slate-300">{d.reason}</td>
              <td className="px-4 py-3 text-slate-400">
                {d.raisedBy.fullName}
                <span className="block text-xs text-slate-600">{d.raisedBy.role}</span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  label={d.status}
                  tone={
                    d.status === "OPEN" || d.status === "IN_REVIEW"
                      ? "amber"
                      : "green"
                  }
                />
                {d.resolution && (
                  <p className="mt-1 text-xs text-slate-500">{d.resolution}</p>
                )}
              </td>
              <td className="px-4 py-3">
                {(d.status === "OPEN" || d.status === "IN_REVIEW") && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Resolution notes…"
                      value={resolution[d.id] ?? ""}
                      onChange={(e) =>
                        setResolution((prev) => ({ ...prev, [d.id]: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                    />
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="secondary"
                        className="!py-1 !text-xs"
                        disabled={loading === d.id}
                        onClick={() => resolve(d.id, "RESOLVED")}
                      >
                        Resolve
                      </Button>
                      <Button
                        variant="ghost"
                        className="!py-1 !text-xs"
                        disabled={loading === d.id}
                        onClick={() => resolve(d.id, "CLOSED")}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {disputes.length === 0 && (
        <p className="py-12 text-center text-slate-500">No disputes filed.</p>
      )}
    </div>
  );
}
