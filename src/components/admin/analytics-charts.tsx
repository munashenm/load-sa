import { formatZAR } from "@/lib/sa-data";

export function BarChart({
  title,
  subtitle,
  items,
  valueKey,
  labelKey,
  formatValue,
  color = "amber",
}: {
  title: string;
  subtitle?: string;
  items: Record<string, string | number>[];
  valueKey: string;
  labelKey: string;
  formatValue?: (n: number) => string;
  color?: "amber" | "sky" | "emerald";
}) {
  const max = Math.max(...items.map((i) => Number(i[valueKey])), 1);
  const barColor =
    color === "sky"
      ? "bg-sky-500"
      : color === "emerald"
        ? "bg-emerald-500"
        : "bg-amber-500";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h3 className="font-semibold text-white">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      <ul className="mt-5 space-y-3">
        {items.map((item) => {
          const value = Number(item[valueKey]);
          const pct = Math.round((value / max) * 100);
          const label = String(item[labelKey]);
          return (
            <li key={label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="truncate text-slate-300">{label}</span>
                <span className="ml-2 shrink-0 font-medium text-white">
                  {formatValue ? formatValue(value) : value}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${barColor} transition-all`}
                  style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function RevenueTrendChart({
  points,
}: {
  points: { label: string; revenue: number; orders: number }[];
}) {
  const maxRevenue = Math.max(...points.map((p) => p.revenue), 1);
  const totalRevenue = points.reduce((s, p) => s + p.revenue, 0);
  const totalOrders = points.reduce((s, p) => s + p.orders, 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">Revenue trend</h3>
          <p className="mt-1 text-sm text-slate-500">Last 30 days — paid & invoiced bookings</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-slate-400">
            Total: <span className="font-semibold text-amber-300">{formatZAR(totalRevenue)}</span>
          </p>
          <p className="text-slate-500">{totalOrders} orders</p>
        </div>
      </div>

      <div className="mt-6 flex h-48 items-end gap-1 sm:gap-1.5">
        {points.map((p) => {
          const heightPct = Math.round((p.revenue / maxRevenue) * 100);
          return (
            <div
              key={p.label}
              className="group relative flex flex-1 flex-col items-center justify-end"
              title={`${p.label}: ${formatZAR(p.revenue)} · ${p.orders} orders`}
            >
              <div
                className="w-full min-w-[4px] rounded-t bg-gradient-to-t from-amber-600 to-amber-400 transition hover:from-amber-500 hover:to-amber-300"
                style={{ height: `${Math.max(heightPct, p.revenue > 0 ? 6 : 2)}%` }}
              />
              <span className="mt-2 hidden text-[10px] text-slate-600 sm:block rotate-0 truncate w-full text-center">
                {p.label.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DriverPerformanceTable({
  drivers,
}: {
  drivers: {
    id: string;
    name: string;
    rating: number;
    completedJobs: number;
    earnings: number;
    onTimeRate: number;
  }[];
}) {
  const maxJobs = Math.max(...drivers.map((d) => d.completedJobs), 1);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h3 className="font-semibold text-white">Driver performance</h3>
      <p className="mt-1 text-sm text-slate-500">Top drivers by completed deliveries</p>

      {drivers.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No completed deliveries yet.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="pb-3 font-medium">Driver</th>
                <th className="pb-3 font-medium">Completed</th>
                <th className="pb-3 font-medium">Rating</th>
                <th className="pb-3 font-medium">Earnings</th>
                <th className="pb-3 font-medium">Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {drivers.map((d) => (
                <tr key={d.id}>
                  <td className="py-3 font-medium text-white">{d.name}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">{d.completedJobs}</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${Math.round((d.completedJobs / maxJobs) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-amber-400">{d.rating.toFixed(1)} ★</td>
                  <td className="py-3 text-slate-300">{formatZAR(d.earnings)}</td>
                  <td className="py-3 text-slate-400">{d.onTimeRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
