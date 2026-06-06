"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { bookingStatusLabels, vehicleTypeLabels } from "@/lib/labels";
import { formatZAR, VEHICLE_OPTIONS } from "@/lib/sa-data";
import { VehicleIcon } from "@/lib/vehicle-icons";
import type { BookingStatus, VehicleType } from "@/lib/types";
import { BookingDetailModal } from "@/components/admin/booking-detail-modal";

export type AdminBookingRow = {
  id: string;
  reference: string;
  status: string;
  vehicleType: string;
  estimatedPrice: number;
  finalPrice: number | null;
  createdAt: string;
  pickupCity: string;
  dropoffCity: string;
  paymentStatus: string;
  proofCount: number;
  customer: { fullName: string; email: string };
  driver: { id: string; user: { fullName: string } } | null;
};

type DriverOption = { id: string; name: string };

const STATUSES = Object.keys(bookingStatusLabels) as BookingStatus[];

export function BookingsTable({
  bookings,
  drivers,
}: {
  bookings: AdminBookingRow[];
  drivers: DriverOption[];
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter && b.status !== statusFilter) return false;
      if (vehicleFilter && b.vehicleType !== vehicleFilter) return false;
      return true;
    });
  }, [bookings, statusFilter, vehicleFilter]);

  async function patchBooking(id: string, body: Record<string, unknown>) {
    setLoading(id);
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {bookingStatusLabels[s]}
            </option>
          ))}
        </select>
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
        >
          <option value="">All vehicles</option>
          {VEHICLE_OPTIONS.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
        <span className="self-center text-sm text-slate-500">
          {filtered.length} of {bookings.length} bookings
        </span>
      </div>

      <ul className="space-y-3 lg:hidden">
        {filtered.map((b) => (
          <li
            key={b.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-sm text-amber-400">{b.reference}</p>
                <p className="mt-1 text-sm text-white">{b.customer.fullName}</p>
              </div>
              <p className="font-bold text-white">
                {formatZAR(b.finalPrice ?? b.estimatedPrice)}
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {b.pickupCity} → {b.dropoffCity}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge
                label={bookingStatusLabels[b.status as BookingStatus] ?? b.status}
                tone="amber"
              />
              <StatusBadge
                label={b.paymentStatus}
                tone={b.paymentStatus === "PAID" ? "green" : "amber"}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <Link href={`/admin/bookings/${b.id}`} className="flex-1">
                <Button className="w-full !py-2 !text-xs">Manage</Button>
              </Link>
              <Button
                variant="ghost"
                className="!p-2"
                onClick={() => setDetailId(b.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-slate-500">No bookings match filters.</p>
        )}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-800 lg:block">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-3">Booking ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Pickup</th>
              <th className="px-4 py-3">Drop-off</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Proof</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-t border-slate-800/80">
                <td className="px-4 py-3 font-mono text-amber-400">{b.reference}</td>
                <td className="px-4 py-3">
                  <p className="text-white">{b.customer.fullName}</p>
                  <p className="text-xs text-slate-500">{b.customer.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{b.pickupCity}</td>
                <td className="px-4 py-3 text-slate-300">{b.dropoffCity}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 text-slate-300">
                    <VehicleIcon type={b.vehicleType} className="h-4 w-4" />
                    <span className="text-xs">
                      {vehicleTypeLabels[b.vehicleType as VehicleType]}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={b.paymentStatus}
                    tone={b.paymentStatus === "PAID" ? "green" : "amber"}
                  />
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {b.proofCount > 0 ? (
                    <span className="text-emerald-400">{b.proofCount} uploaded</span>
                  ) : (
                    <span className="text-slate-500">None</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={b.status}
                    disabled={loading === b.id}
                    onChange={(e) =>
                      patchBooking(b.id, { status: e.target.value })
                    }
                    className="max-w-[140px] rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {bookingStatusLabels[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={b.driver?.id ?? ""}
                    disabled={loading === b.id}
                    onChange={(e) =>
                      patchBooking(b.id, {
                        driverId: e.target.value || null,
                      })
                    }
                    className="max-w-[130px] rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                  >
                    <option value="">Unassigned</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 font-medium text-white">
                  {formatZAR(b.finalPrice ?? b.estimatedPrice)}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(b.createdAt).toLocaleDateString("en-ZA")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      className="!p-2"
                      onClick={() => setDetailId(b.id)}
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Link href={`/admin/bookings/${b.id}`}>
                      <Button variant="secondary" className="!py-1 !text-xs">
                        Open
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="hidden py-12 text-center text-slate-500 lg:block">
            No bookings match filters.
          </p>
        )}
      </div>

      {detailId && (
        <BookingDetailModal bookingId={detailId} onClose={() => setDetailId(null)} />
      )}
    </>
  );
}
