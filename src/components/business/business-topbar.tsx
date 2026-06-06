"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function BusinessTopbar({
  businessName,
  onMenuOpen,
}: {
  businessName: string;
  onMenuOpen: () => void;
}) {
  return (
    <header className="sticky top-16 z-30 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur lg:px-6">
      <button
        type="button"
        onClick={onMenuOpen}
        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <span className="hidden font-bold text-white sm:block">{businessName}</span>
      <div className="flex items-center gap-2">
        <Link href="/" className="hidden text-sm text-slate-400 hover:text-white sm:block">
          Site
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
