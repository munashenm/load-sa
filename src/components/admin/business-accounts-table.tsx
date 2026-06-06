"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";

export type AdminBusinessRow = {
  id: string;
  name: string;
  billingEmail: string;
  billingCity: string | null;
  monthlyInvoicing: boolean;
  status: string;
  memberCount: number;
  bookingCount: number;
  ownerName: string;
};

export function BusinessAccountsTable({ accounts }: { accounts: AdminBusinessRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function act(id: string, action: "suspend" | "activate") {
    setLoading(id);
    await fetch(`/api/admin/business/${id}`, {
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
            <th className="px-4 py-3">Business</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Billing</th>
            <th className="px-4 py-3">Members</th>
            <th className="px-4 py-3">Bookings</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((b) => (
            <tr key={b.id} className="border-t border-slate-800/80">
              <td className="px-4 py-3 font-medium text-white">{b.name}</td>
              <td className="px-4 py-3 text-slate-400">{b.ownerName}</td>
              <td className="px-4 py-3 text-slate-400">
                {b.billingEmail}
                {b.monthlyInvoicing && (
                  <span className="ml-2 rounded bg-blue-500/15 px-1.5 py-0.5 text-xs text-blue-300">
                    Invoiced
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-300">{b.memberCount}</td>
              <td className="px-4 py-3 text-slate-300">{b.bookingCount}</td>
              <td className="px-4 py-3">
                <StatusBadge
                  label={b.status}
                  tone={b.status === "ACTIVE" ? "green" : "red"}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  <Link href={`/business/${b.id}`} target="_blank">
                    <Button variant="ghost" className="!py-1 !text-xs">
                      Portal
                    </Button>
                  </Link>
                  {b.status === "ACTIVE" ? (
                    <Button
                      variant="danger"
                      className="!py-1 !text-xs"
                      disabled={loading === b.id}
                      onClick={() => act(b.id, "suspend")}
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="!py-1 !text-xs"
                      disabled={loading === b.id}
                      onClick={() => act(b.id, "activate")}
                    >
                      Activate
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {accounts.length === 0 && (
        <p className="py-12 text-center text-slate-500">No business accounts yet.</p>
      )}
    </div>
  );
}
