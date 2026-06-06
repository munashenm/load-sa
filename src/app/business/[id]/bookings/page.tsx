import Link from "next/link";
import { redirect } from "next/navigation";
import { BusinessShell } from "@/components/business/business-shell";
import { requireUser } from "@/lib/auth";
import { getBusinessAccessForUser } from "@/lib/business-portal";
import { formatZAR } from "@/lib/sa-data";
import { bookingStatusLabels } from "@/lib/labels";
import { db } from "@/lib/db";
import type { BookingStatus } from "@/lib/types";

export default async function BusinessBookingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["CUSTOMER"], "/business");
  const { id } = await params;
  const access = await getBusinessAccessForUser(user.id, id);
  if (!access) redirect("/business/setup");

  const bookings = await db.booking.findMany({
    where: { businessAccountId: id },
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { fullName: true } },
      driver: { include: { user: { select: { fullName: true } } } },
    },
  });

  return (
    <BusinessShell businessId={id} businessName={access.business.name}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Delivery history</h1>
          <p className="mt-1 text-slate-400">{bookings.length} total bookings</p>
        </div>
        <a
          href={`/api/business/${id}/export`}
          className="text-sm text-sky-400 hover:underline"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
            <tr>
              <th className="p-3 font-medium">Reference</th>
              <th className="p-3 font-medium">Route</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Payment</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Booked by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-slate-900/40">
                <td className="p-3">
                  <Link
                    href={`/track/${b.id}`}
                    className="font-mono text-amber-400 hover:underline"
                  >
                    {b.reference}
                  </Link>
                </td>
                <td className="p-3 text-slate-300">
                  {b.pickupCity} → {b.dropoffCity}
                </td>
                <td className="p-3 text-slate-400">
                  {bookingStatusLabels[b.status as BookingStatus]}
                </td>
                <td className="p-3 text-slate-400">{b.paymentStatus}</td>
                <td className="p-3 text-white">{formatZAR(b.estimatedPrice)}</td>
                <td className="p-3 text-slate-500">{b.customer.fullName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BusinessShell>
  );
}
