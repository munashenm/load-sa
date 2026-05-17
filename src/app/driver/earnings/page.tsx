import { DriverBankForm } from "@/components/driver/driver-bank-form";
import { requireUser } from "@/lib/auth";
import {
  getDriverEarningsStats,
  getDriverProfileForUser,
} from "@/lib/driver-portal";
import { formatZAR } from "@/lib/sa-data";

export default async function DriverEarningsPage() {
  const user = await requireUser(["DRIVER"]);
  const profile = await getDriverProfileForUser(user.id);
  if (!profile) return null;

  const stats = await getDriverEarningsStats(profile.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Earnings</h1>
      <p className="mt-2 text-slate-400">Payouts and commission summary.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Wallet balance", value: formatZAR(profile.walletBalance) },
          { label: "Total earnings", value: formatZAR(stats.totalEarnings) },
          { label: "Completed jobs", value: String(stats.completedCount) },
          {
            label: "Commission deducted",
            value: formatZAR(stats.commissionDeducted),
          },
          { label: "Pending payout", value: formatZAR(stats.pendingPayout) },
          { label: "Paid out", value: formatZAR(stats.paidPayout) },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <p className="text-sm text-slate-400">{c.label}</p>
            <p className="mt-2 text-xl font-bold text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">Payout history</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.payouts.map((p) => (
                <tr key={p.id} className="border-t border-slate-800/80">
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(p.createdAt).toLocaleDateString("en-ZA")}
                  </td>
                  <td className="px-4 py-3 text-white">{formatZAR(p.amount)}</td>
                  <td className="px-4 py-3 text-slate-400">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.payouts.length === 0 && (
            <p className="py-8 text-center text-slate-500">No payouts yet.</p>
          )}
        </div>
      </section>

      <section className="mt-10 max-w-lg">
        <DriverBankForm
          defaults={{
            bankAccountHolder: profile.bankAccountHolder,
            bankName: profile.bankName,
            bankAccountNumber: profile.bankAccountNumber,
            bankBranchCode: profile.bankBranchCode,
          }}
        />
      </section>
    </div>
  );
}
