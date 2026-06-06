"use client";

import { Home, HelpCircle, Plus } from "lucide-react";
import { BottomNav } from "@/components/mobile/bottom-nav";
import { PortalHeader } from "@/components/mobile/portal-header";
import { BRAND_TAGLINE } from "@/lib/brand";

export function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-950">
      <PortalHeader
        title="FluxMove"
        subtitle={BRAND_TAGLINE}
        badge="Customer"
        homeHref="/customer"
      />
      <div className="portal-main mx-auto w-full max-w-lg lg:max-w-4xl">
        {children}
      </div>
      <BottomNav
        items={[
          { href: "/customer", label: "Home", icon: Home, exact: true },
          { href: "/book", label: "Book", icon: Plus, accent: true },
          { href: "/support", label: "Help", icon: HelpCircle },
        ]}
      />
    </div>
  );
}
