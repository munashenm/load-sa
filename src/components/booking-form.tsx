"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  CARGO_SIZE_OPTIONS,
  SA_PROVINCES,
  URGENCY_OPTIONS,
  VEHICLE_OPTIONS,
  formatZAR,
} from "@/lib/sa-data";
import { estimateBookingPrice } from "@/lib/pricing";
import { VehicleIcon } from "@/lib/vehicle-icons";
import type { CargoSize, DeliveryUrgency, VehicleType } from "@/lib/types";

export function BookingForm({ onSuccess }: { onSuccess?: (reference: string) => void }) {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<VehicleType>("BAKKIE");
  const [pickupProvince, setPickupProvince] = useState("Gauteng");
  const [dropoffProvince, setDropoffProvince] = useState("Western Cape");
  const [cargoSize, setCargoSize] = useState<CargoSize>("MEDIUM");
  const [urgency, setUrgency] = useState<DeliveryUrgency>("STANDARD");
  const [weightKg, setWeightKg] = useState("");
  const [cargoImageUrl, setCargoImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
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
        urgency,
        cargoSize,
      ),
    [vehicleType, pickupProvince, dropoffProvince, weightKg, urgency, cargoSize],
  );

  async function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "Image upload failed");
      return;
    }
    setCargoImageUrl(data.url);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    if (cargoImageUrl) {
      payload.cargoImageUrl = cargoImageUrl;
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError("Could not create booking. Check all fields.");
      return;
    }

    const ref = data.booking.reference as string;
    setSuccess(`Booking ${ref} created — we're matching a driver.`);
    onSuccess?.(ref);
    router.refresh();
    e.currentTarget.reset();
    setCargoImageUrl("");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Pickup</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="pickupAddress">Pickup address</Label>
            <Input id="pickupAddress" name="pickupAddress" required placeholder="Street, suburb, estate" />
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
            <Label htmlFor="dropoffAddress">Drop-off address</Label>
            <Input id="dropoffAddress" name="dropoffAddress" required placeholder="Street, suburb, estate" />
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
        <h2 className="mb-4 text-lg font-semibold text-white">Goods & vehicle</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="cargoDescription">Goods description</Label>
            <Textarea
              id="cargoDescription"
              name="cargoDescription"
              rows={3}
              placeholder="What are you moving? e.g. office furniture, 4 pallets of tiles"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cargoSize">Size category</Label>
              <Select
                id="cargoSize"
                name="cargoSize"
                value={cargoSize}
                onChange={(e) => setCargoSize(e.target.value as CargoSize)}
              >
                {CARGO_SIZE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label} — {s.description}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <Input
                id="weightKg"
                name="weightKg"
                type="number"
                min={1}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="cargoDimensions">Dimensions (optional)</Label>
            <Input
              id="cargoDimensions"
              name="cargoDimensions"
              placeholder="e.g. 2.4m × 1.2m × 1m or 6 pallets"
            />
          </div>
          <div>
            <Label htmlFor="vehicleType">Preferred vehicle</Label>
            <div className="flex items-center gap-2">
              <VehicleIcon type={vehicleType} className="h-6 w-6" />
              <Select
                id="vehicleType"
                name="vehicleType"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="flex-1"
              >
                {VEHICLE_OPTIONS.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label} — {v.description}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="cargoImage">Photo of goods (optional)</Label>
            <Input
              id="cargoImage"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={onImageChange}
            />
            {uploading && <p className="mt-1 text-xs text-slate-400">Uploading…</p>}
            {cargoImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cargoImageUrl}
                alt="Uploaded cargo"
                className="mt-2 h-20 w-28 rounded-lg border border-slate-700 object-cover"
              />
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Schedule & urgency</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="scheduledAt">Pickup date & time</Label>
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" />
          </div>
          <div>
            <Label htmlFor="urgency">Delivery urgency</Label>
            <Select
              id="urgency"
              name="urgency"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as DeliveryUrgency)}
            >
              {URGENCY_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label} — {u.description}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-amber-200/80">Estimated price (ZAR)</p>
          <p className="text-2xl font-bold text-amber-300">{formatZAR(estimate)}</p>
          <p className="text-xs text-slate-400">
            Includes urgency & size · final price may be confirmed by driver
          </p>
        </div>
        <Button type="submit" disabled={loading || uploading} className="sm:shrink-0">
          {loading ? "Creating booking…" : "Submit delivery request"}
        </Button>
      </div>

      {error && <FieldError message={error} />}
      {success && (
        <p className="rounded-xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-300">{success}</p>
      )}
    </form>
  );
}
