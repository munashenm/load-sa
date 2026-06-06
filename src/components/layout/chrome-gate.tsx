"use client";

import { usePathname } from "next/navigation";
import { isPortalRoute } from "@/lib/portal-routes";

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isPortalRoute(pathname)) return null;
  return <>{children}</>;
}
