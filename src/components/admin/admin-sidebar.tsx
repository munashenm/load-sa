"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Download,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  Percent,
  Settings,
  Shield,
  Truck,
  Users,
  X,
  Car,
  Bell,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NavSection = {
  title: string;
  links: NavLink[];
};

const sections: NavSection[] = [
  {
    title: "Overview",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/reports", label: "Export reports", icon: Download },
    ],
  },
  {
    title: "Operations",
    links: [
      { href: "/admin/bookings", label: "Bookings", icon: Package },
      { href: "/admin/live-map", label: "Live delivery map", icon: MapPin },
      { href: "/admin/heatmap", label: "Demand heatmap", icon: MapPin },
    ],
  },
  {
    title: "People",
    links: [
      { href: "/admin/drivers", label: "Drivers", icon: Truck },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/business", label: "Business accounts", icon: Building2 },
      { href: "/admin/admins", label: "Admin users", icon: Shield },
    ],
  },
  {
    title: "Finance",
    links: [
      { href: "/admin/commissions", label: "Commission", icon: Percent },
      { href: "/admin/payouts", label: "Driver payouts", icon: Truck },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/admin/complaints", label: "Complaints", icon: AlertTriangle },
      { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
      { href: "/admin/chats", label: "Chat monitoring", icon: MessageSquare },
      { href: "/admin/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    title: "Settings",
    links: [
      { href: "/admin/pricing", label: "Pricing rules", icon: Settings },
      { href: "/admin/vehicles", label: "Vehicle categories", icon: Car },
    ],
  },
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
    <nav className="flex flex-col gap-6 overflow-y-auto p-4 pb-8">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-amber-500/80">
        FluxMove Admin
      </p>
      {sections.map((section) => (
        <div key={section.title}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            {section.title}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.links.map(({ href, label, icon: Icon, exact }) => {
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
          </div>
        </div>
      ))}
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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 transition-transform lg:static lg:z-0 lg:max-h-[calc(100vh-3.5rem)] lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 px-4 lg:hidden">
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
