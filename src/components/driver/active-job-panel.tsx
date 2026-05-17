"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function ActiveJobPanel({
  bookingId,
  reference,
  status,
}: {
  bookingId: string;
  reference: string;
  status: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function shareLocation() {
    setLoading("gps");
    if (!navigator.geolocation) {
      alert("GPS not available in this browser");
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
    await fetch(`/api/bookings/${bookingId}/proof`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setLoading(null);
    router.refresh();
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(reference)}`;

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
        Navigate (Google Maps) →
      </a>

      <Button
        type="button"
        variant="secondary"
        className="w-full !py-2 text-xs"
        disabled={!!loading}
        onClick={shareLocation}
      >
        {loading === "gps" ? "Sharing…" : "Share my location (customer sees live)"}
      </Button>

      <div className="flex flex-wrap gap-2">
        {status === "DRIVER_ASSIGNED" && (
          <Button
            className="!py-2 text-xs"
            disabled={!!loading}
            onClick={() => setStatus("PICKED_UP")}
          >
            Picked up
          </Button>
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
        <Label htmlFor="proof">Proof of delivery</Label>
        <Textarea
          id="proof"
          rows={2}
          placeholder="Recipient name, photo URL, or notes"
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
    </div>
  );
}
