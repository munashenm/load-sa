"use client";

import { useEffect, useMemo, useState } from "react";
import { TrackMapDynamic } from "@/components/track-map-dynamic";
import { bookingStatusLabels } from "@/lib/labels";
import { resolveCityCoords } from "@/lib/sa-data";
import type { BookingStatus } from "@/lib/types";

type Booking = {
  id: string;
  reference: string;
  status: string;
  pickupCity: string;
  pickupProvince: string;
  dropoffCity: string;
  dropoffProvince: string;
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

  const mapPoints = useMemo(() => {
    if (!booking) return null;
    const pickup = {
      ...resolveCityCoords(booking.pickupCity, booking.pickupProvince),
      label: booking.pickupCity,
    };
    const dropoff = {
      ...resolveCityCoords(booking.dropoffCity, booking.dropoffProvince),
      label: booking.dropoffCity,
    };
    const driver =
      booking.driverLat != null && booking.driverLng != null
        ? {
            lat: booking.driverLat,
            lng: booking.driverLng,
            label: booking.driver?.user.fullName ?? "Driver",
          }
        : null;
    return { pickup, dropoff, driver };
  }, [booking]);

  if (!booking) {
    return <p className="text-slate-400">Loading tracking…</p>;
  }

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
        {booking.paymentStatus === "PAID" && (
          <span className="ml-2 text-emerald-400">· Paid</span>
        )}
      </p>

      {booking.driver && (
        <p className="text-sm text-slate-300">
          Driver: {booking.driver.user.fullName} · {booking.driver.user.phone}
        </p>
      )}

      {mapPoints && (
        <TrackMapDynamic
          pickup={mapPoints.pickup}
          dropoff={mapPoints.dropoff}
          driver={mapPoints.driver}
        />
      )}

      <p className="text-xs text-slate-500">Map refreshes every 8 seconds</p>
    </div>
  );
}
