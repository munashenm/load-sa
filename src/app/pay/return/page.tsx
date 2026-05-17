import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PayReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking } = await searchParams;

  if (booking) {
    redirect(`/track/${booking}?paid=pending`);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-white">Payment received</h1>
      <p className="mt-2 text-slate-400">
        We are confirming your payment with PayFast. This may take a minute.
      </p>
      <Link href="/book" className="mt-6 inline-block text-amber-400 hover:underline">
        Back to bookings
      </Link>
    </div>
  );
}
