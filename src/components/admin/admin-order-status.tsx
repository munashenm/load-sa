"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { bookingStatusLabels } from "@/lib/labels";
import type { BookingStatus } from "@/lib/types";

const STATUSES: BookingStatus[] = [
  "SEARCHING_DRIVER",
  "DRIVER_ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

export function AdminOrderStatus({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function onChange(next: BookingStatus) {
    setStatus(next);
    setLoading(true);
    const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      setStatus(currentStatus);
    }
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) => onChange(e.target.value as BookingStatus)}
      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {bookingStatusLabels[s]}
        </option>
      ))}
    </select>
  );
}
