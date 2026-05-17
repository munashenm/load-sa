"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function BookError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-white">Could not load bookings</h1>
      <p className="mt-3 text-sm text-slate-400">
        This is often a database setup issue on the server. Ask your admin to run{" "}
        <code className="text-amber-300">npm run db:migrate</code> on Railway.
      </p>
      <p className="mt-2 text-xs text-slate-500">{error.message}</p>
      <div className="mt-6 flex flex-col gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link href="/" className="text-sm text-amber-400 hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
