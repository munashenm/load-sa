import Link from "next/link";
import { Plus } from "lucide-react";
import { BookingSummaryCard } from "@/components/booking-summary";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

export default async function CustomerDashboardPage() {
  const user = await requireUser(["CUSTOMER"], "/customer");

  const bookings = await db.booking.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      driver: { include: { user: { select: { fullName: true, phone: true } } } },
    },
  });

  const active = bookings.filter(
    (b) => b.status !== "DELIVERED" && b.status !== "CANCELLED",
  );
  const past = bookings.filter(
    (b) => b.status === "DELIVERED" || b.status === "CANCELLED",
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My deliveries</h1>
          <p className="mt-1 text-slate-400">
            Hi {user.fullName} — track status and manage your bookings.
          </p>
        </div>
        <Link href="/book">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New booking
          </Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Total bookings" value={bookings.length} />
        <Stat label="Active" value={active.length} />
        <Stat
          label="Completed"
          value={bookings.filter((b) => b.status === "DELIVERED").length}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">Active bookings</h2>
        {active.length === 0 ? (
          <p className="mt-4 text-slate-400">
            No active deliveries.{" "}
            <Link href="/book" className="text-amber-400 hover:underline">
              Create a request
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {active.map((b) => (
              <li key={b.id}>
                <BookingSummaryCard
                  booking={b}
                  showActions
                  detailHref={`/customer/bookings/${b.id}`}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white">History</h2>
          <ul className="mt-4 space-y-3">
            {past.map((b) => (
              <li key={b.id}>
                <BookingSummaryCard
                  booking={b}
                  detailHref={`/customer/bookings/${b.id}`}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
