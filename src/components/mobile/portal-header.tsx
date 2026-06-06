"use client";

import Link from "next/link";
import { Truck } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function PortalHeader({
  title,
  subtitle,
  badge,
  homeHref,
  showSignOut = true,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  homeHref: string;
  showSignOut?: boolean;
}) {
  return (
    <header className="portal-header sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href={homeHref} className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
            <Truck className="h-4 w-4" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-bold text-white">
              {title}
            </span>
            {subtitle && (
              <span className="block truncate text-[10px] font-normal text-slate-500">
                {subtitle}
              </span>
            )}
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {badge && (
            <span className="hidden rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300 sm:inline">
              {badge}
            </span>
          )}
          {showSignOut && (
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" className="!px-2 !py-1.5 text-xs">
                Sign out
              </Button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
