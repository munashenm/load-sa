import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingChat } from "@/components/chat/booking-chat";
import { ComplaintForm } from "@/components/complaints/complaint-form";
import { BookingSummaryCard } from "@/components/booking-summary";
import { BookingRatingForm } from "@/components/ratings/booking-rating-form";
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

      {booking.paymentStatus === "PAID" &&
        booking.deliveryOtp &&
        booking.status !== "DELIVERED" && (
          <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-5">
            <h2 className="font-semibold text-amber-200">Delivery OTP</h2>
            <p className="mt-1 text-sm text-slate-400">
              Give this code to your driver only when you receive your goods.
            </p>
            <p className="mt-3 font-mono text-3xl tracking-widest text-white">
              {booking.deliveryOtp}
            </p>
          </div>
        )}

      <div className="mt-6">
        <BookingChat bookingId={booking.id} />
      </div>

      {booking.status === "DELIVERED" && (
        <div className="mt-6">
          <BookingRatingForm bookingId={booking.id} targetRole="DRIVER" />
        </div>
      )}

      <div className="mt-6">
        <ComplaintForm bookingId={booking.id} bookingReference={booking.reference} />
      </div>
    </div>
  );
}
