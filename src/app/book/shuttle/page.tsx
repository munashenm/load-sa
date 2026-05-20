import Link from "next/link";
import { ShuttleBookingForm } from "@/components/shuttle-booking-form";
import { requireUser } from "@/lib/auth";
import { SHUTTLE_DESCRIPTION } from "@/lib/shuttle-data";

export default async function BookShuttlePage() {
  await requireUser(["CUSTOMER"], "/book/shuttle");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/book" className="text-sm text-slate-400 hover:text-white">
        ← All booking types
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">
        Shuttle & <span className="text-sky-400">private hire</span>
      </h1>
      <p className="mt-2 text-slate-400">{SHUTTLE_DESCRIPTION}</p>
      <div className="mt-8">
        <ShuttleBookingForm />
      </div>
    </div>
  );
}
