import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingChat } from "@/components/chat/booking-chat";
import { ComplaintForm } from "@/components/complaints/complaint-form";
import { BookingSummaryCard } from "@/components/booking-summary";
import { requireUser } from "@/lib/auth";
import { maskContactForBooking } from "@/lib/chat-access";
import { db } from "@/lib/db";
import { bookingStatusLabels } from "@/lib/labels";
import type { BookingStatus } from "@/lib/types";

export default async function CustomerBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["CUSTOMER"], "/customer");
  const { id } = await params;

  const booking = await db.booking.findFirst({
    where: { id, customerId: user.id },
    include: {
      driver: { include: { user: { select: { fullName: true, phone: true } } } },
    },
  });

  if (!booking) notFound();

  const driverContact = maskContactForBooking(
    booking.driver?.user,
    "CUSTOMER",
    booking.paymentStatus,
    false,
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/customer" className="text-sm text-amber-400 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Booking details</h1>
      <p className="mt-1 text-slate-400">
        Status: {bookingStatusLabels[booking.status as BookingStatus]}
      </p>

      <div className="mt-6">
        <BookingSummaryCard booking={booking} showActions />
      </div>

      {booking.driver && (
        <div className="mt-6 rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
          <h2 className="font-semibold text-emerald-300">Assigned driver</h2>
          <p className="mt-1 text-white">{driverContact?.fullName}</p>
          <p className="text-sm text-slate-400">{driverContact?.phone}</p>
        </div>
      )}

      <div className="mt-6">
        <BookingChat bookingId={booking.id} />
      </div>

      <div className="mt-6">
        <ComplaintForm bookingId={booking.id} bookingReference={booking.reference} />
      </div>
    </div>
  );
}
