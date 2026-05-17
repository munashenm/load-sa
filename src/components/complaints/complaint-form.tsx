"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

export function ComplaintForm({
  bookingId,
  bookingReference,
}: {
  bookingId: string;
  bookingReference: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        subject: form.get("subject"),
        description: form.get("description"),
        priority: form.get("priority"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not submit complaint. Try again.");
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <p className="rounded-xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-300">
        Complaint logged for {bookingReference}. Admin will review shortly.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <p className="text-sm font-medium text-white">Log complaint · {bookingReference}</p>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} required />
      </div>
      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select id="priority" name="priority" defaultValue="NORMAL">
          <option value="LOW">Low</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </Select>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" disabled={loading} className="!py-2 text-xs">
        {loading ? "Submitting…" : "Log complaint"}
      </Button>
    </form>
  );
}
