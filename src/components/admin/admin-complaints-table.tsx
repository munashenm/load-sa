"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { complaintPriorityLabels, complaintStatusLabels } from "@/lib/labels";
export type ComplaintRow = {
  id: string;
  bookingId: string;
  bookingReference: string;
  complainantType: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  raisedByName: string;
};

const STATUSES = ["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"] as const;

export function AdminComplaintsTable({ complaints }: { complaints: ComplaintRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    setLoading(id);
    await fetch(`/api/admin/complaints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-slate-900/80 text-slate-400">
          <tr>
            <th className="px-4 py-3">Booking</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Subject</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">From</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.id} className="border-t border-slate-800/80 align-top">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/bookings/${c.bookingId}`}
                  className="font-mono text-amber-400 hover:underline"
                >
                  {c.bookingReference}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-400">{c.complainantType}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-white">{c.subject}</p>
                <p className="mt-1 max-w-xs text-xs text-slate-500 line-clamp-2">
                  {c.description}
                </p>
              </td>
              <td className="px-4 py-3 text-slate-300">
                {complaintPriorityLabels[c.priority] ?? c.priority}
              </td>
              <td className="px-4 py-3">
                <select
                  value={c.status}
                  disabled={loading === c.id}
                  onChange={(e) => setStatus(c.id, e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {complaintStatusLabels[s]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {new Date(c.createdAt).toLocaleString("en-ZA")}
              </td>
              <td className="px-4 py-3 text-slate-300">{c.raisedByName}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {complaints.length === 0 && (
        <p className="py-12 text-center text-slate-500">No complaints yet.</p>
      )}
    </div>
  );
}
