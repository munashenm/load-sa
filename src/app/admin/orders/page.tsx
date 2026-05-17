import { db } from "@/lib/db";
import { formatZAR } from "@/lib/sa-data";
import { bookingStatusLabels, vehicleTypeLabels } from "@/lib/labels";
import { StatusBadge } from "@/components/status-badge";
import type { BookingStatus, VehicleType } from "@/lib/types";

export default async function AdminOrdersPage() {
  const orders = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      customer: { select: { fullName: true, email: true } },
      driver: { include: { user: { select: { fullName: true } } } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Orders</h1>
      <p className="mt-2 text-slate-400">All delivery requests on the platform.</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="py-3 pr-4">Ref</th>
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Route</th>
              <th className="py-3 pr-4">Driver</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Payment</th>
              <th className="py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-slate-800/60">
                <td className="py-3 pr-4 font-mono text-amber-400">{o.reference}</td>
                <td className="py-3 pr-4 text-slate-300">{o.customer.fullName}</td>
                <td className="py-3 pr-4 text-slate-400">
                  {o.pickupCity} → {o.dropoffCity}
                </td>
                <td className="py-3 pr-4 text-slate-400">
                  {o.driver?.user.fullName ?? "—"}
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge
                    label={bookingStatusLabels[o.status as BookingStatus]}
                    tone="blue"
                  />
                </td>
                <td className="py-3 pr-4 text-slate-400">{o.paymentStatus}</td>
                <td className="py-3 text-white">
                  {formatZAR(o.finalPrice ?? o.estimatedPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="py-8 text-center text-slate-500">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
