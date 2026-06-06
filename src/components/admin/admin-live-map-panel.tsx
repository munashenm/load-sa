"use client";

import dynamic from "next/dynamic";
import type { LiveDeliveryRow } from "@/lib/admin-live";

export const AdminFleetMapDynamic = dynamic(
  () => import("@/components/admin/admin-fleet-map").then((m) => m.AdminFleetMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 text-sm text-slate-500">
        Loading map…
      </div>
    ),
  },
);

export function AdminLiveMapPanel({
  initialDeliveries,
}: {
  initialDeliveries: LiveDeliveryRow[];
}) {
  return <AdminFleetMapDynamic deliveries={initialDeliveries} />;
}
