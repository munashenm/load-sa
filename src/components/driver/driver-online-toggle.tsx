"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DriverOnlineToggle({
  initial,
  canToggle,
  suspended,
}: {
  initial: boolean;
  canToggle: boolean;
  suspended: boolean;
}) {
  const router = useRouter();
  const [online, setOnline] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (!canToggle) return;
    setLoading(true);
    setError(null);
    const next = !online;
    const res = await fetch("/api/driver/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: next }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not update status");
      return;
    }
    setOnline(next);
    router.refresh();
  }

  if (suspended) {
    return (
      <span className="rounded-full bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 ring-1 ring-red-500/40">
        Suspended — offline
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={loading || !canToggle}
        className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
          online
            ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/50"
            : "bg-slate-800 text-slate-400 ring-1 ring-slate-700"
        } ${!canToggle ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? "Updating…" : online ? "Online" : "Offline"}
      </button>
      {!canToggle && (
        <span className="text-xs text-amber-400">Verify profile to go online</span>
      )}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
