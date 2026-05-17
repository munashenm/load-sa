import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isChatUnlocked } from "@/lib/chat-access";
import { getDriverProfileForUser } from "@/lib/driver-portal";
import { db } from "@/lib/db";

export default async function DriverMessagesPage() {
  const user = await requireUser(["DRIVER"]);
  const profile = await getDriverProfileForUser(user.id);
  if (!profile) return null;

  const bookings = await db.booking.findMany({
    where: { driverId: profile.id },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: {
      id: true,
      reference: true,
      paymentStatus: true,
      pickupCity: true,
      dropoffCity: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Messages</h1>
      <p className="mt-2 text-slate-400">
        Chat with customers after payment is confirmed. Admin can monitor chats for disputes.
      </p>

      <ul className="mt-8 space-y-3">
        {bookings.map((b) => {
          const unlocked = isChatUnlocked(b.paymentStatus);
          return (
            <li
              key={b.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-sm text-amber-400">{b.reference}</p>
                  <p className="text-sm text-slate-400">
                    {b.pickupCity} → {b.dropoffCity}
                  </p>
                </div>
                {unlocked ? (
                  <Link
                    href={`/driver/deliveries/${b.id}`}
                    className="text-sm font-semibold text-emerald-400 hover:underline"
                  >
                    Open chat →
                  </Link>
                ) : (
                  <span className="text-xs text-slate-500">
                    Chat will be available after customer payment is confirmed.
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {bookings.length === 0 && (
        <p className="mt-8 text-slate-500">No assigned deliveries yet.</p>
      )}
    </div>
  );
}
