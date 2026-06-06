import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatZAR } from "@/lib/sa-data";

export default async function PaySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking: bookingId } = await searchParams;
  if (!bookingId) redirect("/book");

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      reference: true,
      paymentStatus: true,
      estimatedPrice: true,
      finalPrice: true,
      deliveryOtp: true,
      customerId: true,
    },
  });

  if (!booking || booking.paymentStatus !== "PAID") {
    redirect(`/pay/return?booking=${bookingId}`);
  }

  const user = await getSessionUser();
  const signedIn = user?.id === booking.customerId;
  const trackHref = `/track/${booking.id}`;
  const loginHref = `/login?next=${encodeURIComponent(trackHref)}`;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8">
        <h1 className="text-xl font-bold text-white">Payment successful</h1>
        <p className="mt-2 font-mono text-amber-400">{booking.reference}</p>
        <p className="mt-3 text-slate-300">
          {formatZAR(booking.finalPrice ?? booking.estimatedPrice)} paid. Verified
          drivers can now accept your delivery.
        </p>

        {booking.deliveryOtp && (
          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-500">Your delivery OTP</p>
            <p className="mt-1 font-mono text-2xl tracking-widest text-white">
              {booking.deliveryOtp}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Share this code with your driver only when you receive your goods.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {signedIn ? (
            <Link href={trackHref}>
              <Button className="w-full">Track delivery</Button>
            </Link>
          ) : (
            <>
              <p className="text-xs text-slate-400">
                Sign in to track your delivery and view booking history.
              </p>
              <Link href={loginHref}>
                <Button className="w-full">Sign in to track</Button>
              </Link>
              <Link href={trackHref}>
                <Button variant="secondary" className="w-full">
                  Try track page
                </Button>
              </Link>
            </>
          )}
          <Link href={signedIn ? "/customer" : `/login?next=${encodeURIComponent("/customer")}`}>
            <Button variant="ghost" className="w-full">
              My bookings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
