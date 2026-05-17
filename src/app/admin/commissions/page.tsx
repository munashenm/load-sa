import { db } from "@/lib/db";
import { formatZAR } from "@/lib/sa-data";
import { CommissionForm } from "@/components/admin/commission-form";

export default async function AdminCommissionsPage() {
  const settings = await db.platformSettings.findUnique({
    where: { id: "default" },
  });

  const orders = await db.booking.findMany({
    where: { platformFee: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      reference: true,
      finalPrice: true,
      commissionPercent: true,
      platformFee: true,
      driverEarnings: true,
    },
  });

  const totalFees = orders.reduce((s, o) => s + (o.platformFee ?? 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Commissions</h1>
      <p className="mt-2 text-slate-400">
        Platform take rate applied to each completed paid order.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <p className="text-sm text-slate-400">Default commission</p>
        <p className="text-3xl font-bold text-amber-300">
          {settings?.commissionPercent ?? 15}%
        </p>
        <CommissionForm initial={settings?.commissionPercent ?? 15} />
      </div>

      <p className="mt-8 text-sm text-slate-400">
        Recent commission breakdown · Total: {formatZAR(totalFees)}
      </p>
      <ul className="mt-3 space-y-2">
        {orders.map((o) => (
          <li
            key={o.reference}
            className="flex flex-wrap justify-between gap-2 rounded-xl border border-slate-800 px-4 py-3 text-sm"
          >
            <span className="font-mono text-amber-400">{o.reference}</span>
            <span className="text-slate-400">
              {o.commissionPercent}% · fee {formatZAR(o.platformFee ?? 0)} · driver{" "}
              {formatZAR(o.driverEarnings ?? 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
