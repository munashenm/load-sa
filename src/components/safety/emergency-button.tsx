"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function EmergencyButton({ bookingId }: { bookingId?: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function report() {
    if (text.length < 10) return;
    setLoading(true);
    const res = await fetch("/api/safety/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, description: text }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
      setOpen(false);
    }
  }

  if (sent) {
    return (
      <p className="text-xs text-red-300">Safety report sent — admin notified.</p>
    );
  }

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        className="!border !border-red-500/40 !text-red-400 w-full !py-2 text-xs"
        onClick={() => setOpen(!open)}
      >
        Emergency — report unsafe situation
      </Button>
      {open && (
        <div className="mt-2 space-y-2 rounded-lg border border-red-500/30 bg-red-950/30 p-3">
          <textarea
            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm"
            rows={3}
            placeholder="Describe the situation…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            type="button"
            className="w-full !py-2 text-xs"
            disabled={loading || text.length < 10}
            onClick={report}
          >
            {loading ? "Sending…" : "Alert admin"}
          </Button>
        </div>
      )}
    </div>
  );
}
