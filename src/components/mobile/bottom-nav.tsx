"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

export type BottomNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  accent?: boolean;
  onClick?: () => void;
};

export function BottomNav({
  items,
  accent = "amber",
}: {
  items: BottomNavItem[];
  accent?: "amber" | "emerald";
}) {
  const pathname = usePathname();

  const activeClass =
    accent === "emerald"
      ? "text-emerald-400"
      : "text-amber-400";
  const accentBg =
    accent === "emerald"
      ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30"
      : "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30";

  return (
    <nav
      className="portal-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-lg lg:hidden"
      aria-label="Primary navigation"
    >
      <ul className="mx-auto flex max-w-lg items-end justify-around px-2 pt-2">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          if (item.onClick) {
            return (
              <li key={item.label} className="flex-1">
                <button
                  type="button"
                  onClick={item.onClick}
                  className="flex w-full flex-col items-center gap-1 pb-1 pt-1 text-[10px] font-medium text-slate-500"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  {item.label}
                </button>
              </li>
            );
          }

          if (item.accent) {
            return (
              <li key={item.href} className="flex-1 -mt-3">
                <Link
                  href={item.href}
                  className={clsx(
                    "mx-auto flex h-14 w-14 flex-col items-center justify-center rounded-full font-semibold transition active:scale-95",
                    accentBg,
                  )}
                  aria-label={item.label}
                >
                  <Icon className="h-6 w-6" />
                </Link>
                <p className="mt-1 text-center text-[10px] font-medium text-slate-400">
                  {item.label}
                </p>
              </li>
            );
          }

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={clsx(
                  "flex flex-col items-center gap-1 pb-1 pt-1 text-[10px] font-medium transition",
                  active ? activeClass : "text-slate-500",
                )}
              >
                <Icon className={clsx("h-5 w-5", active && "stroke-[2.5]")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
