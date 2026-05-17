"use client";

import Link from "next/link";
import { Menu, Truck } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function AdminTopbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <header className="sticky top-16 z-30 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/admin" className="hidden items-center gap-2 font-bold text-white sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
            <Truck className="h-4 w-4" />
          </span>
          Admin Console
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/" className="hidden text-sm text-slate-400 hover:text-white sm:block">
          View site
        </Link>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" className="!px-3 !py-2 text-xs">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
