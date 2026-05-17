"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; fullName: string; role: string };
};

export function BookingChat({ bookingId }: { bookingId: string }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [hint, setHint] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/bookings/${bookingId}/chat`);
    const data = await res.json();
    if (!res.ok) return;
    setUnlocked(data.unlocked);
    setHint(data.hint ?? "");
    setMessages(data.messages ?? []);
  }, [bookingId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    setLoading(false);
    if (res.ok) {
      setText("");
      load();
    }
  }

  if (unlocked === null) {
    return <p className="text-sm text-slate-500">Loading chat…</p>;
  }

  if (!unlocked) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
        <p className="text-sm text-amber-200/90">
          {hint || "Chat will be available after payment is confirmed."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="text-sm font-semibold text-white">Secure chat</h3>
      <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
        {messages.length === 0 && (
          <li className="text-xs text-slate-500">No messages yet. Say hello to coordinate pickup.</li>
        )}
        {messages.map((m) => (
          <li key={m.id} className="rounded-lg bg-slate-800/60 px-3 py-2 text-sm">
            <span className="font-medium text-amber-300">{m.sender.fullName}</span>
            <span className="text-xs text-slate-500"> · {m.sender.role}</span>
            <p className="mt-1 text-slate-200">{m.body}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1"
        />
        <Button type="submit" disabled={loading} className="!py-2">
          Send
        </Button>
      </form>
    </div>
  );
}
