import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { requireUser } from "@/lib/auth";
import { DELIVERY_DESCRIPTION } from "@/lib/sa-data";

export default async function BookFreightPage() {
  await requireUser(["CUSTOMER"], "/book/freight");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/book" className="text-sm text-slate-400 hover:text-white">
        ← All booking types
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Freight & delivery</h1>
      <p className="mt-2 text-slate-400">{DELIVERY_DESCRIPTION}</p>
      <div className="mt-8">
        <BookingForm />
      </div>
    </div>
  );
}
