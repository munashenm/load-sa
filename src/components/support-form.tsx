"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function SupportForm() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: form.get("subject"),
        message: form.get("message"),
      }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
  }

  if (done) {
    return <p className="text-emerald-300">Ticket submitted. We will be in touch.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={4} required />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Sending…" : "Submit ticket"}
      </Button>
    </form>
  );
}
