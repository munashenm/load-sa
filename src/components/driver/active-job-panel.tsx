"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingChat } from "@/components/chat/booking-chat";
import { ComplaintForm } from "@/components/complaints/complaint-form";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";

export function ActiveJobPanel({
  bookingId,
  reference,
  status,
  dropoffCity,
}: {
  bookingId: string;
  reference: string;
  status: string;
  dropoffCity: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function shareLocation() {
    setLoading("gps");
    if (!navigator.geolocation) {
      alert("GPS not available");
      setLoading(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await fetch(`/api/bookings/${bookingId}/location`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      });
      setLoading(null);
      router.refresh();
    });
  }

  async function notifyEnRoute() {
    setLoading("enroute");
    await fetch(`/api/bookings/${bookingId}/en-route`, { method: "POST" });
    setLoading(null);
    router.refresh();
  }

  async function setStatus(next: string) {
    setLoading(next);
    await fetch(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(null);
    router.refresh();
  }

  async function submitProof() {
    setLoading("proof");
    let imageUrl: string | undefined;

    if (file) {
      const form = new FormData();
      form.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: form });
      if (up.ok) {
        const data = await up.json();
        imageUrl = data.url;
      }
    }

    await fetch(`/api/bookings/${bookingId}/proof`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, imageUrl }),
    });
    setLoading(null);
    router.refresh();
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dropoffCity)}`;

  return (
    <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-4 space-y-4">
      <p className="font-mono text-sm text-emerald-400">{reference}</p>
      <p className="text-xs text-slate-400">Status: {status}</p>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-sm text-amber-400 hover:underline"
      >
        Navigate to {dropoffCity} (Google Maps) →
      </a>

      <Button
        type="button"
        variant="secondary"
        className="w-full !py-2 text-xs"
        disabled={!!loading}
        onClick={shareLocation}
      >
        {loading === "gps" ? "Sharing…" : "Share live GPS"}
      </Button>

      <div className="flex flex-wrap gap-2">
        {status === "DRIVER_ASSIGNED" && (
          <>
            <Button
              variant="secondary"
              className="!py-2 text-xs"
              disabled={!!loading}
              onClick={notifyEnRoute}
            >
              {loading === "enroute" ? "…" : "En route to pickup"}
            </Button>
            <Button
              className="!py-2 text-xs"
              disabled={!!loading}
              onClick={() => setStatus("PICKED_UP")}
            >
              Picked up
            </Button>
          </>
        )}
        {["PICKED_UP", "IN_TRANSIT"].includes(status) && (
          <Button
            className="!py-2 text-xs"
            disabled={!!loading}
            onClick={() => setStatus("IN_TRANSIT")}
          >
            In transit
          </Button>
        )}
      </div>

      <div>
        <Label htmlFor="proof-photo">Proof photo</Label>
        <input
          id="proof-photo"
          type="file"
          accept="image/*"
          capture="environment"
          className="mt-1 block w-full text-sm text-slate-400"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <div className="mt-3">
          <Label htmlFor="proof">Notes</Label>
        </div>
        <Textarea
          id="proof"
          rows={2}
          placeholder="Recipient name, condition of goods…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button
          type="button"
          className="mt-2 w-full !py-2 text-xs"
          disabled={!!loading}
          onClick={submitProof}
        >
          {loading === "proof" ? "Uploading…" : "Complete delivery"}
        </Button>
      </div>

      <BookingChat bookingId={bookingId} />

      <ComplaintForm bookingId={bookingId} bookingReference={reference} />
    </div>
  );
}
