import { db } from "@/lib/db";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminSupportPage() {
  const tickets = await db.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { user: { select: { fullName: true, email: true, role: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Support</h1>
      <p className="mt-2 text-slate-400">Help requests from customers and drivers.</p>

      <ul className="mt-6 space-y-3">
        {tickets.map((t) => (
          <li
            key={t.id}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-white">{t.subject}</p>
              <StatusBadge label={t.status} tone="blue" />
            </div>
            <p className="mt-2 text-sm text-slate-300">{t.message}</p>
            <p className="mt-2 text-xs text-slate-500">
              {t.user.fullName} · {t.user.email} · {t.user.role}
            </p>
          </li>
        ))}
        {tickets.length === 0 && (
          <p className="text-slate-500">No support tickets yet.</p>
        )}
      </ul>
    </div>
  );
}
