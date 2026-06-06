"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Users,
  FileText,
  Settings,
  Upload,
  X,
} from "lucide-react";

export function BusinessSidebar({
  businessId,
  businessName,
  open,
  onClose,
}: {
  businessId: string;
  businessName: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const base = `/business/${businessId}`;

  const links = [
    { href: base, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `${base}/bookings`, label: "Delivery history", icon: Package },
    { href: `${base}/book`, label: "New booking", icon: PlusCircle },
    { href: `${base}/bulk`, label: "Bulk bookings", icon: Upload },
    { href: `${base}/team`, label: "Team", icon: Users },
    { href: `${base}/invoices`, label: "Invoices", icon: FileText },
    { href: `${base}/settings`, label: "Settings", icon: Settings },
  ];

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
          <span className="truncate font-bold text-white">{businessName}</span>
          <button type="button" onClick={onClose} className="text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="hidden border-b border-slate-800 p-4 lg:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-500/80">
            Business portal
          </p>
          <p className="mt-1 truncate font-bold text-white">{businessName}</p>
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
                    ? "bg-sky-500/15 text-sky-300"
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
