import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

export function StatCard({
  label,
  value,
  href,
  icon: Icon,
  accent = "amber",
}: {
  label: string;
  value: string | number;
  href?: string;
  icon?: LucideIcon;
  accent?: "amber" | "emerald" | "blue" | "slate" | "red";
}) {
  const border =
    accent === "emerald"
      ? "hover:border-emerald-500/40"
      : accent === "blue"
        ? "hover:border-blue-500/40"
        : accent === "red"
          ? "hover:border-red-500/40"
          : "hover:border-amber-500/40";

  const inner = (
    <div
      className={clsx(
        "rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition",
        href && border,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-slate-400">{label}</p>
        {Icon && <Icon className="h-5 w-5 shrink-0 text-amber-500/70" />}
      </div>
      <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">{value}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
