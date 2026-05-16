"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { SA_PROVINCES, VEHICLE_OPTIONS, formatZAR } from "@/lib/sa-data";
import { estimateBookingPrice } from "@/lib/pricing";
import type { VehicleType } from "@/lib/types";

export function BookingForm() {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<VehicleType>("BAKKIE");
  const [pickupProvince, setPickupProvince] = useState("Gauteng");
  const [dropoffProvince, setDropoffProvince] = useState("Western Cape");
  const [weightKg, setWeightKg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const estimate = useMemo(
    () =>
      estimateBookingPrice(
        vehicleType,
        pickupProvince,
        dropoffProvince,
        weightKg ? Number(weightKg) : undefined,
      ),
    [vehicleType, pickupProvince, dropoffProvince, weightKg],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError("Could not create booking. Check all fields.");
      return;
    }

    setSuccess(`Booking ${data.booking.reference} created — we're matching a driver.`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Pickup</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="pickupAddress">Street address</Label>
            <Input id="pickupAddress" name="pickupAddress" required />
          </div>
          <div>
            <Label htmlFor="pickupCity">City / town</Label>
            <Input id="pickupCity" name="pickupCity" required />
          </div>
          <div>
            <Label htmlFor="pickupProvince">Province</Label>
            <Select
              id="pickupProvince"
              name="pickupProvince"
              value={pickupProvince}
              onChange={(e) => setPickupProvince(e.target.value)}
            >
              {SA_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Drop-off</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="dropoffAddress">Street address</Label>
            <Input id="dropoffAddress" name="dropoffAddress" required />
          </div>
          <div>
            <Label htmlFor="dropoffCity">City / town</Label>
            <Input id="dropoffCity" name="dropoffCity" required />
          </div>
          <div>
            <Label htmlFor="dropoffProvince">Province</Label>
            <Select
              id="dropoffProvince"
              name="dropoffProvince"
              value={dropoffProvince}
              onChange={(e) => setDropoffProvince(e.target.value)}
            >
              {SA_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Cargo & vehicle</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="vehicleType">Vehicle needed</Label>
            <Select
              id="vehicleType"
              name="vehicleType"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as VehicleType)}
            >
              {VEHICLE_OPTIONS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label} — {v.description}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="cargoDescription">What are you moving?</Label>
            <Textarea
              id="cargoDescription"
              name="cargoDescription"
              rows={3}
              placeholder="e.g. furniture, pallets, empty truck return CT to JHB"
              required
            />
          </div>
          <div>
            <Label htmlFor="weightKg">Approx. weight (kg)</Label>
            <Input
              id="weightKg"
              name="weightKg"
              type="number"
              min={1}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="scheduledAt">Preferred pickup (optional)</Label>
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-amber-200/80">Estimated fare (indicative)</p>
          <p className="text-2xl font-bold text-amber-300">{formatZAR(estimate)}</p>
          <p className="text-xs text-slate-400">Final price agreed with your matched driver</p>
        </div>
        <Button type="submit" disabled={loading} className="sm:shrink-0">
          {loading ? "Booking…" : "Request driver"}
        </Button>
      </div>

      {error && <FieldError message={error} />}
      {success && (
        <p className="rounded-xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-300">
          {success}
        </p>
      )}
    </form>
  );
}
