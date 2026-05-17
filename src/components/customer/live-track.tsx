"use client";

import { useEffect, useState } from "react";
import { bookingStatusLabels } from "@/lib/labels";
import type { BookingStatus } from "@/lib/types";

type Booking = {
  id: string;
  reference: string;
  status: string;
  pickupCity: string;
  dropoffCity: string;
  driverLat: number | null;
  driverLng: number | null;
  lastLocationAt: string | null;
  paymentStatus: string;
  driver?: { user: { fullName: string; phone: string } } | null;
};

export function LiveTrack({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setBooking(data.booking);
      }
    }
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [bookingId]);

  if (!booking) {
    return <p className="text-slate-400">Loading tracking…</p>;
  }

  const hasLocation =
    booking.driverLat != null && booking.driverLng != null;

  return (
    <div className="space-y-4">
      <p className="font-mono text-amber-400">{booking.reference}</p>
      <p className="text-white">
        {booking.pickupCity} → {booking.dropoffCity}
      </p>
      <p className="text-sm text-slate-400">
        Status:{" "}
        <span className="text-amber-300">
          {bookingStatusLabels[booking.status as BookingStatus]}
        </span>
      </p>

      {booking.driver && (
        <p className="text-sm text-slate-300">
          Driver: {booking.driver.user.fullName} · {booking.driver.user.phone}
        </p>
      )}

      {hasLocation ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm font-medium text-emerald-300">Live location</p>
          <p className="mt-1 font-mono text-xs text-slate-400">
            {booking.driverLat?.toFixed(5)}, {booking.driverLng?.toFixed(5)}
          </p>
          <a
            className="mt-2 inline-block text-sm text-amber-400 hover:underline"
            href={`https://www.google.com/maps?q=${booking.driverLat},${booking.driverLng}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps →
          </a>
          {booking.lastLocationAt && (
            <p className="mt-2 text-xs text-slate-500">
              Updated {new Date(booking.lastLocationAt).toLocaleString("en-ZA")}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Waiting for driver GPS — driver app shares location when job is active.
        </p>
      )}

      <p className="text-xs text-slate-500">Refreshes every 8 seconds</p>
    </div>
  );
}
