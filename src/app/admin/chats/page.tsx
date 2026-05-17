import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminChatsPage() {
  const bookings = await db.booking.findMany({
    where: { chatMessages: { some: {} } },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      customer: { select: { fullName: true } },
      driver: { include: { user: { select: { fullName: true } } } },
      _count: { select: { chatMessages: true } },
      chatMessages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { fullName: true, role: true } } },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Chat monitoring</h1>
      <p className="mt-2 text-slate-400">
        View chat history for paid bookings — dispute resolution.
      </p>
      <ul className="mt-6 space-y-3">
        {bookings.map((b) => {
          const last = b.chatMessages[0];
          return (
            <li
              key={b.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="font-mono text-amber-400 hover:underline"
                  >
                    {b.reference}
                  </Link>
                  <p className="mt-1 text-sm text-slate-400">
                    {b.customer.fullName}
                    {b.driver && ` ↔ ${b.driver.user.fullName}`}
                    · {b._count.chatMessages} messages · Payment: {b.paymentStatus}
                  </p>
                  {last && (
                    <p className="mt-2 text-xs text-slate-500">
                      Last: {last.sender.fullName} ({last.sender.role}):{" "}
                      {last.body.slice(0, 80)}
                      {last.body.length > 80 ? "…" : ""}
                    </p>
                  )}
                </div>
                <Link
                  href={`/admin/bookings/${b.id}#chat`}
                  className="text-sm text-amber-400 hover:underline"
                >
                  View thread →
                </Link>
              </div>
            </li>
          );
        })}
        {bookings.length === 0 && (
          <p className="text-slate-500">No chat threads yet.</p>
        )}
      </ul>
    </div>
  );
}
