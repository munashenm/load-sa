"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";

export type AdminCustomerRow = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  accountStatus: string;
  bookingCount: number;
};

export function CustomersTable({ customers }: { customers: AdminCustomerRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function act(id: string, action: "block" | "unblock") {
    setLoading(`${id}-${action}`);
    await fetch(`/api/admin/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="bg-slate-900/80 text-slate-400">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Total bookings</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-t border-slate-800/80">
              <td className="px-4 py-3 font-medium text-white">{c.fullName}</td>
              <td className="px-4 py-3 text-slate-400">{c.phone}</td>
              <td className="px-4 py-3 text-slate-400">{c.email}</td>
              <td className="px-4 py-3 text-slate-300">{c.bookingCount}</td>
              <td className="px-4 py-3">
                <StatusBadge
                  label={c.accountStatus === "BLOCKED" ? "Blocked" : "Active"}
                  tone={c.accountStatus === "BLOCKED" ? "red" : "green"}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  <Link href={`/admin/customers/${c.id}`}>
                    <Button variant="secondary" className="!py-1 !text-xs">
                      View bookings
                    </Button>
                  </Link>
                  {c.accountStatus === "BLOCKED" ? (
                    <Button
                      variant="secondary"
                      className="!py-1 !text-xs"
                      disabled={!!loading}
                      onClick={() => act(c.id, "unblock")}
                    >
                      Unblock
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      className="!py-1 !text-xs"
                      disabled={!!loading}
                      onClick={() => act(c.id, "block")}
                    >
                      Block
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {customers.length === 0 && (
        <p className="py-12 text-center text-slate-500">No customers yet.</p>
      )}
    </div>
  );
}
