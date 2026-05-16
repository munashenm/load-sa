"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AvailabilityToggle({ initial }: { initial: boolean }) {
  const router = useRouter();
  const [available, setAvailable] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !available;
    const res = await fetch("/api/driver/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: next }),
    });
    setLoading(false);
    if (res.ok) {
      setAvailable(next);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        available
          ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
          : "bg-slate-800 text-slate-400 ring-1 ring-slate-700"
      }`}
    >
      {loading ? "Updating…" : available ? "Available for jobs" : "Go available"}
    </button>
  );
}
