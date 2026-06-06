"use client";

import { useState } from "react";
import { BusinessSidebar } from "@/components/business/business-sidebar";
import { BusinessTopbar } from "@/components/business/business-topbar";

export function BusinessShell({
  businessId,
  businessName,
  children,
}: {
  businessId: string;
  businessName: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950">
      <BusinessTopbar
        businessName={businessName}
        onMenuOpen={() => setSidebarOpen(true)}
      />
      <div className="flex">
        <BusinessSidebar
          businessId={businessId}
          businessName={businessName}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
