"use client";

import { Download } from "lucide-react";

const exports = [
  {
    title: "All bookings",
    description: "Reference, status, payment, routes, pricing, customer, driver, and business.",
    href: "/api/admin/export?type=bookings",
    filename: "fluxmove-bookings.csv",
  },
  {
    title: "All drivers",
    description: "Verification status, availability, vehicle, job count, and wallet balance.",
    href: "/api/admin/export?type=drivers",
    filename: "fluxmove-drivers.csv",
  },
];

export function ExportReportsPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {exports.map((item) => (
        <div
          key={item.href}
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
        >
          <h3 className="font-semibold text-white">{item.title}</h3>
          <p className="mt-2 text-sm text-slate-400">{item.description}</p>
          <a
            href={item.href}
            download={item.filename}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500/15 px-4 py-2.5 text-sm font-medium text-amber-300 transition hover:bg-amber-500/25"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </a>
        </div>
      ))}
    </div>
  );
}
