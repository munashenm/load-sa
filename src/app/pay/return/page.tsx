import Link from "next/link";
import { redirect } from "next/navigation";
import { completeBookingPayment } from "@/lib/complete-booking-payment";
import { verifyPaystackTransaction } from "@/lib/paystack";

export default async function PayReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string; reference?: string; trxref?: string }>;
}) {
  const { booking, reference, trxref } = await searchParams;
  const paystackRef = reference ?? trxref;

  if (paystackRef) {
    const verified = await verifyPaystackTransaction(paystackRef);

    if (verified?.status === "success") {
      const bookingId = verified.bookingId ?? booking;
      if (bookingId) {
        await completeBookingPayment(
          bookingId,
          verified.amount,
          verified.providerRef,
        );
        redirect(`/track/${bookingId}?paid=1`);
      }
    }

    if (verified?.status === "failed") {
      return (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="text-xl font-bold text-white">Payment failed</h1>
          <p className="mt-2 text-slate-400">
            Your payment was not completed. You can try again from your booking.
          </p>
          <Link
            href={booking ? `/track/${booking}` : "/book"}
            className="mt-6 inline-block text-amber-400 hover:underline"
          >
            Back to booking
          </Link>
        </div>
      );
    }
  }

  if (booking) {
    redirect(`/track/${booking}?paid=pending`);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-white">Payment received</h1>
      <p className="mt-2 text-slate-400">
        We are confirming your payment with Paystack. This may take a minute.
      </p>
      <Link href="/book" className="mt-6 inline-block text-amber-400 hover:underline">
        Back to bookings
      </Link>
    </div>
  );
}
