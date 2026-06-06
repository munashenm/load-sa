"use client";

import { clsx } from "clsx";
import { Check } from "lucide-react";
import {
  trackingStepIndex,
  trackingTimelineSteps,
} from "@/lib/labels";
import type { BookingStatus } from "@/lib/types";

export function DeliveryTrackingTimeline({
  status,
  paymentStatus,
}: {
  status: BookingStatus;
  paymentStatus?: string;
}) {
  if (status === "CANCELLED") {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        This booking was cancelled.
      </p>
    );
  }

  const currentIndex = trackingStepIndex(status, paymentStatus);

  return (
    <ol className="space-y-0">
      {trackingTimelineSteps.map((step, index) => {
        const done = index <= currentIndex;
        const active = index === currentIndex;
        const isLast = index === trackingTimelineSteps.length - 1;

        return (
          <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                className={clsx(
                  "absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5",
                  done ? "bg-amber-500/60" : "bg-slate-800",
                )}
              />
            )}
            <span
              className={clsx(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                done
                  ? "border-amber-500 bg-amber-500 text-slate-950"
                  : "border-slate-700 bg-slate-900 text-slate-500",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            <div className="pt-0.5">
              <p
                className={clsx(
                  "text-sm font-medium",
                  active ? "text-amber-300" : done ? "text-white" : "text-slate-500",
                )}
              >
                {step.label}
              </p>
              {active && (
                <p className="mt-0.5 text-xs text-slate-500">Current status</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
