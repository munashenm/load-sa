import Link from "next/link";
import { Truck } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-50">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
            <Truck className="h-5 w-5" />
          </span>
          <span>
            Load <span className="text-amber-400">SA</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden text-sm text-slate-300 hover:text-white sm:block"
                >
                  Admin
                </Link>
              )}
              {user.role === "DRIVER" ? (
                <Link
                  href="/driver"
                  className="hidden text-sm text-slate-300 hover:text-white sm:block"
                >
                  Driver hub
                </Link>
              ) : user.role === "CUSTOMER" ? (
                <Link
                  href="/book"
                  className="hidden text-sm text-slate-300 hover:text-white sm:block"
                >
                  Book delivery
                </Link>
              ) : null}
              <form action="/api/auth/logout" method="GET">
                <Button
                  type="submit"
                  variant="ghost"
                  className="!px-3 !py-2 text-xs sm:text-sm"
                >
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="!px-3 !py-2">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="!px-3 !py-2">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
