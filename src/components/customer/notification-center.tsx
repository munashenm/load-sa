"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  booking: { id: string; reference: string } | null;
};

export function NotificationCenter() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    if (res.ok) {
      setItems(data.notifications);
      setUnread(data.unreadCount);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    load();
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Bell className="h-5 w-5 text-amber-400" />
          Notifications
          {unread > 0 && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-slate-950">
              {unread}
            </span>
          )}
        </h2>
        {unread > 0 && (
          <Button variant="ghost" className="!py-1 !text-xs" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>
      <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
        {items.length === 0 && (
          <li className="text-sm text-slate-500">No notifications yet.</li>
        )}
        {items.map((n) => (
          <li
            key={n.id}
            className={`rounded-lg border px-3 py-2 text-sm ${
              n.read
                ? "border-slate-800/60 bg-slate-900/30 text-slate-400"
                : "border-amber-500/30 bg-amber-500/5 text-slate-200"
            }`}
          >
            <p className="font-medium text-white">{n.title}</p>
            <p className="mt-0.5">{n.message}</p>
            <p className="mt-1 text-xs text-slate-500">
              {new Date(n.createdAt).toLocaleString("en-ZA")}
              {n.booking && (
                <>
                  {" · "}
                  <Link
                    href={`/track/${n.booking.id}`}
                    className="text-amber-400 hover:underline"
                  >
                    {n.booking.reference}
                  </Link>
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
