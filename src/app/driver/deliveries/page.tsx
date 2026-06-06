import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDriverProfileForUser } from "@/lib/driver-portal";
import { db } from "@/lib/db";
import { bookingStatusLabels } from "@/lib/labels";
import type { BookingStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default async function DriverDeliveriesPage() {
  const user = await requireUser(["DRIVER"]);
  const profile = await getDriverProfileForUser(user.id);
  if (!profile) return null;

  const deliveries = await db.booking.findMany({
    where: { driverId: profile.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-white sm:text-2xl">My deliveries</h1>
      <p className="mt-2 text-sm text-slate-400">
        Update status, upload proof photos, and complete OTP delivery.
      </p>

      <ul className="mt-6 space-y-3 lg:hidden">
        {deliveries.map((d) => (
          <li
            key={d.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <p className="font-mono text-sm text-amber-400">{d.reference}</p>
            <p className="mt-2 text-sm text-slate-300">
              {d.pickupCity} → {d.dropoffCity}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {bookingStatusLabels[d.status as BookingStatus] ?? d.status} ·{" "}
              {d.paymentStatus}
            </p>
            <Link href={`/driver/deliveries/${d.id}`} className="mt-3 block">
              <Button className="w-full">Manage delivery</Button>
            </Link>
          </li>
        ))}
        {deliveries.length === 0 && (
          <p className="py-12 text-center text-slate-500">No deliveries yet.</p>
        )}
      </ul>

      <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-slate-800 lg:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-3">Booking ID</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id} className="border-t border-slate-800/80">
                <td className="px-4 py-3 font-mono text-amber-400">{d.reference}</td>
                <td className="px-4 py-3 text-slate-300">
                  {d.pickupCity} → {d.dropoffCity}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {bookingStatusLabels[d.status as BookingStatus] ?? d.status}
                </td>
                <td className="px-4 py-3 text-slate-500">{d.paymentStatus}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/driver/deliveries/${d.id}`}
                    className="text-sm font-medium text-emerald-400 hover:underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {deliveries.length === 0 && (
          <p className="py-12 text-center text-slate-500">No deliveries yet.</p>
        )}
      </div>
    </div>
  );
}
