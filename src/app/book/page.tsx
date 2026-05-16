import { BookingForm } from "@/components/booking-form";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatZAR } from "@/lib/sa-data";
import { bookingStatusLabels, vehicleTypeLabels } from "@/lib/labels";
import type { BookingStatus, VehicleType } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";

export default async function BookPage() {
  const user = await requireUser(["CUSTOMER"]);

  const bookings = await db.booking.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Book a delivery</h1>
      <p className="mt-2 text-slate-400">
        Tell us what to move — we match verified drivers across South Africa.
      </p>

      <div className="mt-8">
        <BookingForm />
      </div>

      {bookings.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-white">Your bookings</h2>
          <ul className="mt-4 space-y-3">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm text-amber-400">{b.reference}</span>
                  <StatusBadge
                    label={bookingStatusLabels[b.status as BookingStatus]}
                    tone={
                      b.status === "DELIVERED"
                        ? "green"
                        : b.status === "CANCELLED"
                          ? "red"
                          : "blue"
                    }
                  />
                </div>
                <p className="mt-2 text-sm text-white">
                  {b.pickupCity} → {b.dropoffCity}
                </p>
                <p className="text-xs text-slate-500">
                  {vehicleTypeLabels[b.vehicleType as VehicleType]} ·{" "}
                  {formatZAR(b.estimatedPrice)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
