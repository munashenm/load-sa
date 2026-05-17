"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  BarChart3,
  Headphones,
  LayoutDashboard,
  Package,
  Percent,
  Scale,
  Truck,
  Wallet,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/commissions", label: "Commissions", icon: Percent },
  { href: "/admin/payouts", label: "Payouts", icon: Wallet },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/disputes", label: "Disputes", icon: Scale },
  { href: "/admin/support", label: "Support", icon: Headphones },
  { href: "/admin/drivers", label: "Drivers", icon: Truck },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-amber-500/15 text-amber-300"
                : "text-slate-400 hover:bg-slate-800 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
