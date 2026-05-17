import Link from "next/link";
import { LiveTrack } from "@/components/customer/live-track";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["CUSTOMER", "DRIVER", "ADMIN"]);
  const { id } = await params;

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking) {
    return <p className="p-8 text-slate-400">Booking not found.</p>;
  }

  const allowed =
    booking.customerId === user.id ||
    user.role === "ADMIN" ||
    user.driverProfile?.id === booking.driverId;

  if (!allowed) {
    return <p className="p-8 text-slate-400">Access denied.</p>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href="/book" className="text-sm text-amber-400 hover:underline">
        ← Back to bookings
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Track delivery</h1>
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <LiveTrack bookingId={id} />
      </div>
    </div>
  );
}
