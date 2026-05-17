import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingSummaryCard } from "@/components/booking-summary";
import { db } from "@/lib/db";
import { bookingStatusLabels } from "@/lib/labels";
import type { BookingStatus } from "@/lib/types";

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      customer: { select: { fullName: true, email: true, phone: true } },
      driver: { include: { user: { select: { fullName: true, phone: true } } } },
    },
  });

  if (!booking) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/bookings" className="text-sm text-amber-400 hover:underline">
        ← Back to bookings
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">{booking.reference}</h1>
      <p className="mt-1 text-slate-400">
        {bookingStatusLabels[booking.status as BookingStatus]} · {booking.customer.fullName}
      </p>
      <div className="mt-6">
        <BookingSummaryCard booking={booking} />
      </div>
      {booking.driver && (
        <p className="mt-4 text-sm text-slate-400">
          Driver: {booking.driver.user.fullName} · {booking.driver.user.phone}
        </p>
      )}
    </div>
  );
}
