"use client";

import { useState } from "react";
import {
  Briefcase,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Truck,
  Wallet,
} from "lucide-react";
import { DriverSidebar } from "@/components/driver/driver-sidebar";
import { BottomNav } from "@/components/mobile/bottom-nav";
import { PortalHeader } from "@/components/mobile/portal-header";

export function DriverShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-slate-950">
      <PortalHeader
        title="FluxMove Driver"
        subtitle="On the road"
        badge="Driver"
        homeHref="/driver"
      />
      <div className="flex">
        <DriverSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="portal-main min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
      <BottomNav
        accent="emerald"
        items={[
          { href: "/driver", label: "Home", icon: LayoutDashboard, exact: true },
          { href: "/driver/jobs", label: "Jobs", icon: Briefcase },
          { href: "/driver/deliveries", label: "Active", icon: Truck, accent: true },
          { href: "/driver/earnings", label: "Earn", icon: Wallet },
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
