"use client";

import { useState } from "react";
import { DriverSidebar } from "@/components/driver/driver-sidebar";
import { DriverTopbar } from "@/components/driver/driver-topbar";

export function DriverShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950">
      <DriverTopbar onMenuOpen={() => setOpen(true)} />
      <div className="flex">
        <DriverSidebar open={open} onClose={() => setOpen(false)} />
        <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
