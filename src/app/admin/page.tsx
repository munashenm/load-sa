import Link from "next/link";
import { db } from "@/lib/db";
import { formatZAR } from "@/lib/sa-data";

export default async function AdminOverviewPage() {
  const [orders, paid, drivers, openDisputes, openTickets] = await Promise.all([
    db.booking.count(),
    db.booking.count({ where: { paymentStatus: "PAID" } }),
    db.driverProfile.count({ where: { verificationStatus: "APPROVED" } }),
    db.dispute.count({ where: { status: "OPEN" } }),
    db.supportTicket.count({ where: { status: "OPEN" } }),
  ]);

  const revenue = await db.booking.aggregate({
    where: { paymentStatus: "PAID" },
    _sum: { platformFee: true, finalPrice: true },
  });

  const stats = [
    { label: "Total orders", value: orders, href: "/admin/orders" },
    { label: "Paid orders", value: paid, href: "/admin/orders" },
    { label: "Active drivers", value: drivers, href: "/admin/drivers" },
    { label: "Open disputes", value: openDisputes, href: "/admin/disputes" },
    { label: "Support tickets", value: openTickets, href: "/admin/support" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Admin dashboard</h1>
      <p className="mt-2 text-slate-400">
        Control orders, commissions, payouts, analytics, disputes, and support.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-amber-500/40"
          >
            <p className="text-sm text-slate-400">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-white">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <p className="text-sm text-amber-200/80">Platform revenue (paid orders)</p>
        <p className="text-2xl font-bold text-amber-300">
          {formatZAR(revenue._sum.platformFee ?? 0)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Gross processed: {formatZAR(revenue._sum.finalPrice ?? 0)}
        </p>
      </div>
    </div>
  );
}
