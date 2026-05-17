import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { requireUser } from "@/lib/auth";

export default async function BookPage() {
  await requireUser(["CUSTOMER"], "/book");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">New delivery request</h1>
          <p className="mt-2 text-slate-400">
            Pickup, drop-off, goods details, and instant ZAR estimate.
          </p>
        </div>
        <Link href="/customer" className="text-sm text-amber-400 hover:underline">
          View my bookings →
        </Link>
      </div>

      <div className="mt-8">
        <BookingForm />
      </div>
    </div>
  );
}
