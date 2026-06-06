import Link from "next/link";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { requireUser } from "@/lib/auth";
import { BRAND_DESCRIPTION } from "@/lib/brand";

export default async function BookFreightPage() {
  await requireUser(["CUSTOMER"], "/book/freight");

  return (
    <div className="px-4 py-6 sm:px-6">
      <Link href="/book" className="text-sm text-slate-400 hover:text-white">
        ← All booking types
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Book a delivery</h1>
      <p className="mt-2 text-slate-400">{BRAND_DESCRIPTION}</p>
      <div className="mt-8">
        <BookingWizard />
      </div>
    </div>
  );
}
