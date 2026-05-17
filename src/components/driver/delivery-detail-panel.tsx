"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingChat } from "@/components/chat/booking-chat";
import { ComplaintForm } from "@/components/complaints/complaint-form";
import { EmergencyButton } from "@/components/safety/emergency-button";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { bookingStatusLabels } from "@/lib/labels";
import type { BookingStatus } from "@/lib/types";

const NEXT_STATUS: Partial<Record<BookingStatus, BookingStatus>> = {
  DRIVER_ASSIGNED: "EN_ROUTE_PICKUP",
  EN_ROUTE_PICKUP: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "NEAR_DESTINATION",
  NEAR_DESTINATION: "DELIVERED",
};

export function DeliveryDetailPanel({
  bookingId,
  reference,
  status,
  pickupCity,
  dropoffCity,
  paymentStatus,
  hasPickupProof,
  hasDeliveryProof,
  customerName,
  customerPhone,
}: {
  bookingId: string;
  reference: string;
  status: string;
  pickupCity: string;
  dropoffCity: string;
  paymentStatus: string;
  hasPickupProof: boolean;
  hasDeliveryProof: boolean;
  customerName: string;
  customerPhone: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [proofType, setProofType] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [otp, setOtp] = useState("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const st = status as BookingStatus;
  const next = NEXT_STATUS[st];
  const mapsPickup = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pickupCity)}`;
  const mapsDrop = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dropoffCity)}`;

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

  async function setStatus(nextStatus: string) {
    setLoading(nextStatus);
    await fetch(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setLoading(null);
    router.refresh();
  }

  async function submitProof() {
    setLoading("proof");
    let imageUrl: string | undefined;
    let signatureUrl: string | undefined;
    if (file) {
      const form = new FormData();
      form.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: form });
      if (up.ok) {
        const data = await up.json();
        imageUrl = data.url;
      }
    }
    if (signatureFile) {
      const form = new FormData();
      form.append("file", signatureFile);
      const up = await fetch("/api/upload", { method: "POST", body: form });
      if (up.ok) {
        const data = await up.json();
        signatureUrl = data.url;
      }
    }
    await fetch(`/api/bookings/${bookingId}/proof`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, imageUrl, signatureUrl, proofType }),
    });
    setLoading(null);
    router.refresh();
  }

  async function verifyOtp() {
    setLoading("otp");
    const res = await fetch(`/api/bookings/${bookingId}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "OTP verification failed");
      return;
    }
    router.refresh();
  }

  const active = !["DELIVERED", "CANCELLED"].includes(status);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-5">
        <p className="font-mono text-sm text-emerald-400">{reference}</p>
        <p className="mt-1 text-lg font-semibold text-white">
          {bookingStatusLabels[st] ?? status}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Customer: {customerName} · {customerPhone}
        </p>
      </div>

      {active && (
        <>
          <div className="flex flex-wrap gap-3">
            <a
              href={mapsPickup}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-400 hover:underline"
            >
              Navigate to pickup ({pickupCity}) →
            </a>
            <a
              href={mapsDrop}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-400 hover:underline"
            >
              Navigate to drop-off ({dropoffCity}) →
            </a>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full !py-2 text-xs"
            disabled={!!loading}
            onClick={shareLocation}
          >
            {loading === "gps" ? "Sharing…" : "Share live GPS"}
          </Button>

          {next && status !== "DELIVERED" && (
            <Button
              className="w-full"
              disabled={!!loading}
              onClick={() => setStatus(next)}
            >
              {loading === next
                ? "Updating…"
                : `Mark as ${bookingStatusLabels[next]}`}
            </Button>
          )}

          {status === "DELIVERED" && (
            <p className="text-sm text-emerald-400">Delivery completed.</p>
          )}

          {paymentStatus === "PAID" && status !== "DELIVERED" && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
              <p className="text-sm font-medium text-amber-200">OTP delivery verification</p>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Customer 6-digit OTP"
                maxLength={6}
              />
              <Button
                type="button"
                className="w-full !py-2 text-xs"
                disabled={loading === "otp" || otp.length !== 6}
                onClick={verifyOtp}
              >
                {loading === "otp" ? "Verifying…" : "Confirm delivery with OTP"}
              </Button>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
            <p className="text-sm font-medium text-white">Digital proof (photo & signature)</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProofType("PICKUP")}
                className={`rounded-lg px-3 py-1 text-xs ${
                  proofType === "PICKUP"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                Pickup {hasPickupProof ? "✓" : ""}
              </button>
              <button
                type="button"
                onClick={() => setProofType("DELIVERY")}
                className={`rounded-lg px-3 py-1 text-xs ${
                  proofType === "DELIVERY"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                Delivery {hasDeliveryProof ? "✓" : ""}
              </button>
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="block w-full text-sm text-slate-400"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Label>Signature image (optional)</Label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-slate-400"
              onChange={(e) => setSignatureFile(e.target.files?.[0] ?? null)}
            />
            <Label htmlFor="proof-notes">Notes</Label>
            <Textarea
              id="proof-notes"
              rows={2}
              placeholder="Condition, recipient, reference numbers…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button
              type="button"
              className="w-full !py-2 text-xs"
              disabled={!!loading || !file}
              onClick={submitProof}
            >
              {loading === "proof"
                ? "Uploading…"
                : `Upload ${proofType === "PICKUP" ? "pickup" : "delivery"} proof`}
            </Button>
          </div>
        </>
      )}

      <BookingChat bookingId={bookingId} />
      {paymentStatus !== "PAID" && (
        <p className="text-xs text-slate-500">
          Customer phone and full chat unlock after payment is confirmed.
        </p>
      )}

      <EmergencyButton bookingId={bookingId} />
      <ComplaintForm bookingId={bookingId} bookingReference={reference} />
    </div>
  );
}
