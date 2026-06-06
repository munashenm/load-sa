"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { AdminFleetMapDynamic } from "@/components/admin/admin-live-map-panel";
import { bookingStatusLabels } from "@/lib/labels";
import type { LiveDeliveryRow } from "@/lib/admin-live";
import type { BookingStatus } from "@/lib/types";

export function AdminLiveDeliveriesClient({
  initialDeliveries,
}: {
  initialDeliveries: LiveDeliveryRow[];
}) {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/live-deliveries");
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.deliveries);
      }
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {deliveries.length} active deliver{deliveries.length === 1 ? "y" : "ies"}
          </p>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        <AdminFleetMapDynamic deliveries={deliveries} />
      </div>
      <aside className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="text-sm font-semibold text-white">Active list</h2>
        <ul className="mt-3 max-h-[380px] space-y-2 overflow-y-auto">
          {deliveries.map((d) => (
            <li key={d.id} className="rounded-xl border border-slate-800/80 p-3 text-sm">
              <Link
                href={`/admin/bookings/${d.id}`}
                className="font-mono text-amber-400 hover:underline"
              >
                {d.reference}
              </Link>
              <p className="mt-1 text-slate-400">
                {d.pickupCity} → {d.dropoffCity}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {bookingStatusLabels[d.status as BookingStatus] ?? d.status}
                {d.driverName ? ` · ${d.driverName}` : ""}
              </p>
            </li>
          ))}
          {deliveries.length === 0 && (
            <li className="py-8 text-center text-slate-500">No active deliveries.</li>
          )}
        </ul>
      </aside>
    </div>
  );
}
