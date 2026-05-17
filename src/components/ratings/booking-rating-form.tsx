"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";

const DRIVER_CRITERIA = [
  { key: "professionalism", label: "Professionalism" },
  { key: "speed", label: "Speed" },
  { key: "communication", label: "Communication" },
];

const CUSTOMER_CRITERIA = [
  { key: "cooperation", label: "Customer cooperation" },
  { key: "waitingTime", label: "Waiting time" },
  { key: "safety", label: "Safety at pickup/drop-off" },
];

export function BookingRatingForm({
  bookingId,
  targetRole,
}: {
  bookingId: string;
  targetRole: "DRIVER" | "CUSTOMER";
}) {
  const criteria = targetRole === "DRIVER" ? DRIVER_CRITERIA : CUSTOMER_CRITERIA;
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetRole, scores, comment }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
  }

  if (done) {
    return (
      <p className="text-sm text-emerald-400">Thank you — your rating was submitted.</p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-800 p-4">
      <p className="text-sm font-medium text-white">
        Rate {targetRole === "DRIVER" ? "your driver" : "this customer"}
      </p>
      {criteria.map(({ key, label }) => (
        <div key={key}>
          <Label>{label}</Label>
          <select
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            value={scores[key] ?? ""}
            onChange={(e) =>
              setScores((s) => ({ ...s, [key]: Number(e.target.value) }))
            }
          >
            <option value="">Select 1–5</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} ★
              </option>
            ))}
          </select>
        </div>
      ))}
      <div>
        <Label htmlFor="rating-comment">Comment (optional)</Label>
        <Textarea
          id="rating-comment"
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading} className="!py-2 text-xs">
        {loading ? "Submitting…" : "Submit rating"}
      </Button>
    </form>
  );
}
