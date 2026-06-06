"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  Settings,
  Shield,
  MessageSquare,
  AlertTriangle,
  Bell,
  X,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: Package },
  { href: "/admin/drivers", label: "Drivers", icon: Truck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/complaints", label: "Complaints", icon: AlertTriangle },
  { href: "/admin/chats", label: "Chat monitoring", icon: MessageSquare },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/pricing", label: "Pricing Settings", icon: Settings },
  { href: "/admin/heatmap", label: "Driver heatmap", icon: Truck },
  { href: "/admin/analytics", label: "Analytics", icon: LayoutDashboard },
  { href: "/admin/admins", label: "Admin Users", icon: Shield },
];

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const nav = (
    <nav className="flex flex-col gap-1 p-4">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-amber-500/80">
        FluxMove Admin
      </p>
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
                ? "bg-amber-500/15 text-amber-300"
                : "text-slate-400 hover:bg-slate-800/80 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

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
            Flux<span className="text-amber-400">Move</span>
          </span>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        {nav}
      </aside>
    </>
  );
}
