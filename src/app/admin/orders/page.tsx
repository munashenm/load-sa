import { db } from "@/lib/db";
import { formatZAR } from "@/lib/sa-data";
import {
  bookingStatusLabels,
  urgencyLabels,
  vehicleTypeLabels,
} from "@/lib/labels";
import { AdminOrderStatus } from "@/components/admin/admin-order-status";
import { StatusBadge } from "@/components/status-badge";
import type { BookingStatus, DeliveryUrgency, VehicleType } from "@/lib/types";

export default async function AdminOrdersPage() {
  const orders = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      customer: { select: { fullName: true, email: true } },
      driver: { include: { user: { select: { fullName: true } } } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Bookings</h1>
      <p className="mt-2 text-slate-400">
        Manage all delivery requests, statuses, and assignments.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="py-3 pr-3">Ref</th>
              <th className="py-3 pr-3">Customer</th>
              <th className="py-3 pr-3">Route</th>
              <th className="py-3 pr-3">Cargo</th>
              <th className="py-3 pr-3">Urgency</th>
              <th className="py-3 pr-3">Driver</th>
              <th className="py-3 pr-3">Status</th>
              <th className="py-3 pr-3">Payment</th>
              <th className="py-3">ZAR</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-slate-800/60 align-top">
                <td className="py-3 pr-3 font-mono text-amber-400">{o.reference}</td>
                <td className="py-3 pr-3">
                  <p className="text-slate-300">{o.customer.fullName}</p>
                  <p className="text-xs text-slate-500">{o.customer.email}</p>
                </td>
                <td className="py-3 pr-3 text-slate-400">
                  <p>
                    {o.pickupCity} → {o.dropoffCity}
                  </p>
                  <p className="text-xs text-slate-500">
                    {vehicleTypeLabels[o.vehicleType as VehicleType]}
                  </p>
                </td>
                <td className="max-w-[140px] py-3 pr-3 text-xs text-slate-500">
                  {o.cargoDescription.slice(0, 60)}
                  {o.cargoDescription.length > 60 ? "…" : ""}
                </td>
                <td className="py-3 pr-3 text-slate-400">
                  {urgencyLabels[(o.urgency ?? "STANDARD") as DeliveryUrgency]}
                </td>
                <td className="py-3 pr-3 text-slate-400">
                  {o.driver?.user.fullName ?? "—"}
                </td>
                <td className="py-3 pr-3">
                  <AdminOrderStatus
                    bookingId={o.id}
                    currentStatus={o.status as BookingStatus}
                  />
                </td>
                <td className="py-3 pr-3">
                  <StatusBadge
                    label={o.paymentStatus}
                    tone={o.paymentStatus === "PAID" ? "green" : "amber"}
                  />
                </td>
                <td className="py-3 font-medium text-white">
                  {formatZAR(o.finalPrice ?? o.estimatedPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="py-8 text-center text-slate-500">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}
