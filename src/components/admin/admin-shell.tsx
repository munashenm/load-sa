"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  Truck,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { BottomNav } from "@/components/mobile/bottom-nav";
import { PortalHeader } from "@/components/mobile/portal-header";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-slate-950">
      <PortalHeader
        title="FluxMove Admin"
        subtitle="Platform control"
        badge="Admin"
        homeHref="/admin"
      />
      <div className="flex">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="portal-main min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
      <BottomNav
        items={[
          { href: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
          { href: "/admin/bookings", label: "Orders", icon: Package },
          { href: "/admin/live-map", label: "Map", icon: MapPin, accent: true },
          { href: "/admin/drivers", label: "Drivers", icon: Truck },
          {
            href: "#",
            label: "Menu",
            icon: Menu,
            onClick: () => setSidebarOpen(true),
          },
        ]}
      />
    </div>
  );
}
