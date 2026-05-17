import { formatZAR } from "@/lib/sa-data";
import type { PriceBreakdown } from "@/lib/smart-pricing";

export function PriceBreakdownCard({ breakdown }: { breakdown: PriceBreakdown }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
      <p className="font-medium text-white">Price breakdown</p>
      <ul className="mt-3 space-y-1.5">
        {breakdown.lines.map((line) => (
          <li key={line.label} className="flex justify-between text-slate-400">
            <span>{line.label}</span>
            <span className="text-slate-200">{formatZAR(line.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between border-t border-slate-800 pt-3 font-semibold text-amber-300">
        <span>Total estimate</span>
        <span>{formatZAR(breakdown.total)}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">~{breakdown.distanceKm} km estimated</p>
    </div>
  );
}
