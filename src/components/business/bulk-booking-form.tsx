"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddressAutocomplete } from "@/components/maps/address-autocomplete";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { SA_PROVINCES } from "@/lib/sa-data";
import type { VehicleType } from "@/lib/types";

type Row = {
  pickupAddress: string;
  pickupCity: string;
  pickupProvince: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffProvince: string;
  dropoffLat?: number;
  dropoffLng?: number;
  vehicleType: VehicleType;
  cargoDescription: string;
  scheduledAt: string;
};

const emptyRow = (): Row => ({
  pickupAddress: "",
  pickupCity: "",
  pickupProvince: "Gauteng",
  dropoffAddress: "",
  dropoffCity: "",
  dropoffProvince: "Gauteng",
  vehicleType: "BAKKIE",
  cargoDescription: "",
  scheduledAt: "",
});

export function BulkBookingForm({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  function updateRow(index: number, field: keyof Row, value: string) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function patchRow(index: number, patch: Partial<Row>) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    const bookings = rows
      .filter((r) => r.pickupAddress && r.dropoffAddress && r.cargoDescription)
      .map((r) => ({
        ...r,
        urgency: "STANDARD" as const,
        deliveryCategory: "GENERAL" as const,
        insuranceLevel: "STANDARD" as const,
        scheduledAt: r.scheduledAt || undefined,
      }));

    if (bookings.length === 0) {
      setError("Add at least one complete row");
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/business/${businessId}/bookings/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookings }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError("Bulk upload failed");
      return;
    }

    setResult(`Created ${data.created} booking(s).`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <p className="text-sm text-slate-400">
        Add multiple scheduled deliveries in one submission. Pick addresses from Google
        suggestions for accurate pricing and tracking.
      </p>

      {rows.map((row, i) => (
        <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="mb-4 text-sm font-semibold text-sky-300">Delivery {i + 1}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Pickup address</Label>
              <AddressAutocomplete
                value={row.pickupAddress}
                onChange={(value) => updateRow(i, "pickupAddress", value)}
                onPlaceSelected={(place) =>
                  patchRow(i, {
                    pickupAddress: place.address,
                    pickupCity: place.city,
                    pickupProvince: place.province,
                    pickupLat: place.lat,
                    pickupLng: place.lng,
                  })
                }
                placeholder="Start typing pickup address…"
              />
            </div>
            <div>
              <Label>Pickup city</Label>
              <Input
                value={row.pickupCity}
                onChange={(e) => updateRow(i, "pickupCity", e.target.value)}
              />
            </div>
            <div>
              <Label>Pickup province</Label>
              <Select
                value={row.pickupProvince}
                onChange={(e) => updateRow(i, "pickupProvince", e.target.value)}
              >
                {SA_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Drop-off address</Label>
              <AddressAutocomplete
                value={row.dropoffAddress}
                onChange={(value) => updateRow(i, "dropoffAddress", value)}
                onPlaceSelected={(place) =>
                  patchRow(i, {
                    dropoffAddress: place.address,
                    dropoffCity: place.city,
                    dropoffProvince: place.province,
                    dropoffLat: place.lat,
                    dropoffLng: place.lng,
                  })
                }
                placeholder="Start typing drop-off address…"
              />
            </div>
            <div>
              <Label>Drop-off city</Label>
              <Input
                value={row.dropoffCity}
                onChange={(e) => updateRow(i, "dropoffCity", e.target.value)}
              />
            </div>
            <div>
              <Label>Drop-off province</Label>
              <Select
                value={row.dropoffProvince}
                onChange={(e) => updateRow(i, "dropoffProvince", e.target.value)}
              >
                {SA_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Vehicle</Label>
              <Select
                value={row.vehicleType}
                onChange={(e) => updateRow(i, "vehicleType", e.target.value)}
              >
                <option value="BAKKIE">Bakkie</option>
                <option value="PANEL_VAN">Panel van</option>
                <option value="LIGHT_TRUCK">Light truck</option>
                <option value="MEDIUM_TRUCK">Truck</option>
              </Select>
            </div>
            <div>
              <Label>Scheduled pickup</Label>
              <Input
                type="datetime-local"
                value={row.scheduledAt}
                onChange={(e) => updateRow(i, "scheduledAt", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={row.cargoDescription}
                onChange={(e) => updateRow(i, "cargoDescription", e.target.value)}
                placeholder="What needs to be delivered"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        onClick={() => setRows((r) => [...r, emptyRow()])}
      >
        Add another delivery
      </Button>

      {error && <FieldError message={error} />}
      {result && (
        <p className="rounded-xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-300">{result}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating bookings…" : "Submit bulk bookings"}
      </Button>
    </form>
  );
}
