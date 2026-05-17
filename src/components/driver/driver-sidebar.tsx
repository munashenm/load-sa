"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Briefcase,
  Truck,
  Wallet,
  MessageSquare,
  AlertTriangle,
  User,
  Car,
  X,
} from "lucide-react";

const links = [
  { href: "/driver", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/driver/jobs", label: "Available Jobs", icon: Briefcase },
  { href: "/driver/deliveries", label: "My Deliveries", icon: Truck },
  { href: "/driver/earnings", label: "Earnings", icon: Wallet },
  { href: "/driver/messages", label: "Messages", icon: MessageSquare },
  { href: "/driver/complaints", label: "Complaints", icon: AlertTriangle },
  { href: "/driver/profile", label: "Profile & Verification", icon: User },
  { href: "/driver/vehicle", label: "Vehicle Details", icon: Car },
];

export function DriverSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-950 transition-transform lg:static lg:z-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4 lg:hidden">
          <span className="font-bold text-white">
            Load <span className="text-amber-400">SA</span> Driver
          </span>
          <button type="button" onClick={onClose} className="text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
