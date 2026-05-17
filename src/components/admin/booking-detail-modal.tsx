"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { bookingStatusLabels, urgencyLabels, vehicleTypeLabels } from "@/lib/labels";
import { formatZAR } from "@/lib/sa-data";
import type { BookingStatus, DeliveryUrgency, VehicleType } from "@/lib/types";

type BookingDetail = {
  reference: string;
  status: string;
  urgency: string;
  vehicleType: string;
  estimatedPrice: number;
  cargoDescription: string;
  pickupAddress: string;
  pickupCity: string;
  dropoffAddress: string;
  dropoffCity: string;
  customer: { fullName: string; email: string; phone: string };
  driver: { user: { fullName: string; phone: string } } | null;
};

export function BookingDetailModal({
  bookingId,
  onClose,
}: {
  bookingId: string;
  onClose: () => void;
}) {
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.booking) setBooking(d.booking);
        else setError("Could not load booking");
      })
      .catch(() => setError("Could not load booking"));
  }, [bookingId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold text-white">Booking details</h2>
        {error && <p className="mt-4 text-red-400">{error}</p>}
        {!booking && !error && <p className="mt-4 text-slate-400">Loading…</p>}
        {booking && (
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Reference" value={booking.reference} />
            <Row
              label="Status"
              value={bookingStatusLabels[booking.status as BookingStatus]}
            />
            <Row label="Customer" value={`${booking.customer.fullName} · ${booking.customer.email}`} />
            <Row label="Phone" value={booking.customer.phone} />
            <Row label="Pickup" value={`${booking.pickupAddress}, ${booking.pickupCity}`} />
            <Row label="Drop-off" value={`${booking.dropoffAddress}, ${booking.dropoffCity}`} />
            <Row label="Vehicle" value={vehicleTypeLabels[booking.vehicleType as VehicleType]} />
            <Row label="Urgency" value={urgencyLabels[booking.urgency as DeliveryUrgency]} />
            <Row label="Cargo" value={booking.cargoDescription} />
            <Row label="Price" value={formatZAR(booking.estimatedPrice)} />
            <Row
              label="Driver"
              value={
                booking.driver
                  ? `${booking.driver.user.fullName} (${booking.driver.user.phone})`
                  : "Unassigned"
              }
            />
          </dl>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-200">{value}</dd>
    </div>
  );
}
