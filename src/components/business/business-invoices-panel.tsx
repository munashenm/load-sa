"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatZAR } from "@/lib/sa-data";

type Invoice = {
  id: string;
  reference: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  status: string;
  dueAt: string | null;
};

export function BusinessInvoicesPanel({
  businessId,
  canManage,
  monthlyInvoicing,
  initialInvoices,
}: {
  businessId: string;
  canManage: boolean;
  monthlyInvoicing: boolean;
  initialInvoices: Invoice[];
}) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function generateInvoice() {
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/business/${businessId}/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error ?? "Could not generate invoice");
      return;
    }
    setInvoices((prev) => [
      {
        id: data.invoice.id,
        reference: data.invoice.reference,
        periodStart: data.invoice.periodStart,
        periodEnd: data.invoice.periodEnd,
        totalAmount: data.invoice.totalAmount,
        status: data.invoice.status,
        dueAt: data.invoice.dueAt,
      },
      ...prev,
    ]);
    setMessage(`Invoice ${data.invoice.reference} generated.`);
  }

  if (!monthlyInvoicing) {
    return (
      <p className="rounded-xl border border-slate-800 p-4 text-sm text-slate-500">
        Turn on monthly invoicing in Settings to consolidate deliveries into one bill.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <Button type="button" onClick={generateInvoice} disabled={loading}>
          {loading ? "Generating…" : "Generate invoice for last month"}
        </Button>
      )}
      {message && <p className="text-sm text-emerald-400">{message}</p>}

      <ul className="divide-y divide-slate-800 rounded-2xl border border-slate-800">
        {invoices.length === 0 ? (
          <li className="p-4 text-sm text-slate-500">No invoices yet.</li>
        ) : (
          invoices.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-mono text-amber-400">{inv.reference}</p>
                <p className="text-sm text-slate-500">
                  {new Date(inv.periodStart).toLocaleDateString("en-ZA")} –{" "}
                  {new Date(inv.periodEnd).toLocaleDateString("en-ZA")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">{formatZAR(inv.totalAmount)}</p>
                <p className="text-xs text-slate-500">{inv.status}</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
