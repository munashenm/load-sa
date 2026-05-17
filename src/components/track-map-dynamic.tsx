"use client";

import dynamic from "next/dynamic";

export const TrackMapDynamic = dynamic(
  () => import("@/components/track-map").then((m) => m.TrackMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center rounded-xl bg-slate-900 text-sm text-slate-500">
        Loading map…
      </div>
    ),
  },
);
