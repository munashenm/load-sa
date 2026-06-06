"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { PriceBreakdownCard } from "@/components/pricing/price-breakdown";
import { AddressAutocomplete } from "@/components/maps/address-autocomplete";
import { VEHICLE_CATEGORIES } from "@/lib/vehicle-categories";
import { SA_PROVINCES, formatZAR } from "@/lib/sa-data";
import { VehicleIcon } from "@/lib/vehicle-icons";
import type { DeliveryStop } from "@/lib/smart-pricing";
import type { DeliveryUrgency, VehicleType } from "@/lib/types";
import type { PriceBreakdown } from "@/lib/smart-pricing";

const STEPS = [
  "Pickup",
  "Drop-off & stops",
  "Vehicle",
  "Item details",
  "Photos",
  "Delivery time",
  "Review & pay",
  "Confirmation",
] as const;

type StopDraft = {
  address: string;
  city: string;
  province: string;
  label: string;
  lat?: number;
  lng?: number;
};

function parseWeightKg(value: string): number | undefined {
  const w = Number(value);
  if (!Number.isFinite(w) || w <= 0) return undefined;
  return Math.round(w);
}

function formatBookingError(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "Could not create booking. Please try again.";
  }
  const body = data as { error?: unknown };
  if (typeof body.error === "string") return body.error;
  if (body.error && typeof body.error === "object") {
    const fieldErrors = body.error as Record<string, string[] | undefined>;
    const messages = Object.entries(fieldErrors).flatMap(([field, msgs]) =>
      (msgs ?? []).map((m) => `${field.replace(/([A-Z])/g, " $1").toLowerCase()}: ${m}`),
    );
    if (messages.length > 0) return messages.join(" ");
  }
  return "Could not create booking. Check all fields.";
}

export function BookingWizard({
  businessId,
  monthlyInvoicing = false,
  successBasePath,
}: {
  businessId?: string;
  monthlyInvoicing?: boolean;
  successBasePath?: string;
} = {}) {
  const [step, setStep] = useState(0);

  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [pickupProvince, setPickupProvince] = useState("Gauteng");
  const [pickupLat, setPickupLat] = useState<number | undefined>();
  const [pickupLng, setPickupLng] = useState<number | undefined>();

  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffCity, setDropoffCity] = useState("");
  const [dropoffProvince, setDropoffProvince] = useState("Western Cape");
  const [dropoffLat, setDropoffLat] = useState<number | undefined>();
  const [dropoffLng, setDropoffLng] = useState<number | undefined>();

  const [stops, setStops] = useState<StopDraft[]>([]);

  const [vehicleType, setVehicleType] = useState<VehicleType>("BAKKIE");
  const [cargoDescription, setCargoDescription] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [cargoDimensions, setCargoDimensions] = useState("");
  const [cargoImageUrl, setCargoImageUrl] = useState("");

  const [deliveryMode, setDeliveryMode] = useState<"immediate" | "scheduled">("immediate");
  const [urgency, setUrgency] = useState<DeliveryUrgency>("STANDARD");
  const [scheduledAt, setScheduledAt] = useState("");

  const [estimate, setEstimate] = useState(0);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const validStops: DeliveryStop[] = stops
    .filter((s) => s.address && s.city)
    .map((s) => ({
      address: s.address,
      city: s.city,
      province: s.province,
      label: s.label || undefined,
      lat: s.lat,
      lng: s.lng,
    }));

  useEffect(() => {
    if (step >= 6) return;
    const effectiveUrgency = deliveryMode === "scheduled" ? "STANDARD" : urgency;
    const t = setTimeout(async () => {
      const res = await fetch("/api/pricing/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleType,
          pickupProvince,
          dropoffProvince,
          pickupCity,
          dropoffCity,
          pickupLat,
          pickupLng,
          dropoffLat,
          dropoffLng,
          weightKg: weightKg ? Number(weightKg) : undefined,
          urgency: effectiveUrgency,
          stops: validStops,
          scheduledAt: deliveryMode === "scheduled" ? scheduledAt : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEstimate(data.total);
        setBreakdown(data.breakdown);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [
    vehicleType,
    pickupProvince,
    dropoffProvince,
    pickupCity,
    dropoffCity,
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    weightKg,
    urgency,
    deliveryMode,
    scheduledAt,
    stops,
    step,
  ]);

  function addStop() {
    setStops((prev) => [
      ...prev,
      { address: "", city: "", province: pickupProvince, label: `Stop ${prev.length + 1}` },
    ]);
  }

  function removeStop(index: number) {
    setStops((prev) => prev.filter((_, i) => i !== index));
  }

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

  function canProceed(): boolean {
    if (step === 0) {
      return pickupAddress.trim().length >= 5 && pickupCity.trim().length >= 2;
    }
    if (step === 1) {
      return dropoffAddress.trim().length >= 5 && dropoffCity.trim().length >= 2;
    }
    if (step === 3) return cargoDescription.trim().length >= 10;
    if (step === 5 && deliveryMode === "scheduled") return Boolean(scheduledAt);
    return true;
  }

  function validateBeforeSubmit(): string | null {
    if (pickupAddress.trim().length < 5) {
      return "Pickup address must be at least 5 characters.";
    }
    if (dropoffAddress.trim().length < 5) {
      return "Drop-off address must be at least 5 characters.";
    }
    if (cargoDescription.trim().length < 10) {
      return "Describe what you are moving in at least 10 characters.";
    }
    if (weightKg && parseWeightKg(weightKg) === undefined) {
      return "Enter a valid weight in kg (whole number greater than 0), or leave it blank.";
    }
    if (deliveryMode === "scheduled" && !scheduledAt) {
      return "Choose a date and time for your scheduled delivery.";
    }
    return null;
  }

  async function createBooking() {
    setError(null);
    const validationError = validateBeforeSubmit();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const effectiveUrgency = deliveryMode === "scheduled" ? "STANDARD" : urgency;
    const payload = {
      pickupAddress: pickupAddress.trim(),
      pickupCity: pickupCity.trim(),
      pickupProvince,
      pickupLat,
      pickupLng,
      dropoffAddress: dropoffAddress.trim(),
      dropoffCity: dropoffCity.trim(),
      dropoffProvince,
      dropoffLat,
      dropoffLng,
      vehicleType,
      cargoDescription: cargoDescription.trim(),
      weightKg: parseWeightKg(weightKg),
      cargoDimensions: cargoDimensions.trim() || undefined,
      cargoImageUrl: cargoImageUrl || undefined,
      urgency: effectiveUrgency,
      scheduledAt: deliveryMode === "scheduled" ? scheduledAt : undefined,
      stops: validStops.length > 0 ? validStops : undefined,
      deliveryCategory: "GENERAL" as const,
      insuranceLevel: "STANDARD" as const,
    };

    const url = businessId
      ? `/api/business/${businessId}/bookings`
      : "/api/bookings";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(formatBookingError(data));
      return;
    }
    setBookingId(data.booking.id);
    setReference(data.booking.reference);
    setPaymentStatus(data.paymentStatus ?? data.booking.paymentStatus ?? null);
    setStep(7);
  }

  return (
    <div className="space-y-6">
      <div className="lg:hidden">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>
            Step {Math.min(step + 1, 7)} of 7
          </span>
          <span className="font-medium text-amber-300/90">{STEPS[Math.min(step, 6)]}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-300"
            style={{ width: `${(Math.min(step + 1, 7) / 7) * 100}%` }}
          />
        </div>
      </div>

      <nav className="hidden flex-wrap gap-2 lg:flex">
        {STEPS.slice(0, 7).map((label, i) => (
          <button
            key={label}
            type="button"
            disabled={i > step || step === 7}
            onClick={() => i < step && setStep(i)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              i === step
                ? "bg-amber-500 text-slate-950"
                : i < step
                  ? "bg-slate-800 text-amber-300"
                  : "bg-slate-900 text-slate-600"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </nav>

      {step === 0 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Step 1 — Pickup address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Pickup address</Label>
              <AddressAutocomplete
                value={pickupAddress}
                onChange={setPickupAddress}
                onPlaceSelected={(place) => {
                  setPickupAddress(place.address);
                  setPickupCity(place.city);
                  setPickupProvince(place.province);
                  setPickupLat(place.lat);
                  setPickupLng(place.lng);
                }}
                placeholder="Start typing an address in South Africa…"
                required
              />
            </div>
            <div>
              <Label>City / town</Label>
              <Input value={pickupCity} onChange={(e) => setPickupCity(e.target.value)} required />
            </div>
            <div>
              <Label>Province</Label>
              <Select value={pickupProvince} onChange={(e) => setPickupProvince(e.target.value)}>
                {SA_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </div>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Multi-stop destinations</h2>
              <Button type="button" variant="secondary" className="gap-1 text-xs" onClick={addStop}>
                <Plus className="h-3 w-3" /> Add stop
              </Button>
            </div>
            <p className="mb-4 text-sm text-slate-500">
              Optional intermediate stops — pricing recalculates automatically.
            </p>
            {stops.length === 0 ? (
              <p className="text-sm text-slate-600">No extra stops — direct delivery.</p>
            ) : (
              <ul className="space-y-4">
                {stops.map((stop, i) => (
                  <li key={i} className="rounded-xl border border-slate-800 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-amber-300">{stop.label}</span>
                      <button type="button" onClick={() => removeStop(i)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label>Address</Label>
                        <AddressAutocomplete
                          value={stop.address}
                          onChange={(value) => {
                            const next = [...stops];
                            next[i] = { ...next[i], address: value };
                            setStops(next);
                          }}
                          onPlaceSelected={(place) => {
                            const next = [...stops];
                            next[i] = {
                              ...next[i],
                              address: place.address,
                              city: place.city,
                              province: place.province,
                              lat: place.lat,
                              lng: place.lng,
                            };
                            setStops(next);
                          }}
                          placeholder="Stop address"
                        />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input
                          value={stop.city}
                          onChange={(e) => {
                            const next = [...stops];
                            next[i] = { ...next[i], city: e.target.value };
                            setStops(next);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Province</Label>
                        <Select
                          value={stop.province}
                          onChange={(e) => {
                            const next = [...stops];
                            next[i] = { ...next[i], province: e.target.value };
                            setStops(next);
                          }}
                        >
                          {SA_PROVINCES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <h2 className="mb-4 text-lg font-semibold text-white">Final drop-off</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Drop-off address</Label>
                <AddressAutocomplete
                  value={dropoffAddress}
                  onChange={setDropoffAddress}
                  onPlaceSelected={(place) => {
                    setDropoffAddress(place.address);
                    setDropoffCity(place.city);
                    setDropoffProvince(place.province);
                    setDropoffLat(place.lat);
                    setDropoffLng(place.lng);
                  }}
                  placeholder="Final delivery address"
                  required
                />
              </div>
              <div>
                <Label>City / town</Label>
                <Input value={dropoffCity} onChange={(e) => setDropoffCity(e.target.value)} required />
              </div>
              <div>
                <Label>Province</Label>
                <Select value={dropoffProvince} onChange={(e) => setDropoffProvince(e.target.value)}>
                  {SA_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Step 3 — Vehicle selection</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {VEHICLE_CATEGORIES.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setVehicleType(c.vehicleType)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                    vehicleType === c.vehicleType
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <VehicleIcon type={c.vehicleType} className="h-6 w-6" />
                  <div>
                    <p className="font-medium text-white">{c.label}</p>
                    <p className="text-xs text-slate-400">{c.loadCapacity}</p>
                    <p className="mt-1 text-xs text-amber-400">From {formatZAR(c.startingPrice)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 3 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Step 4 — Item description</h2>
          <div className="space-y-4">
            <div>
              <Label>What are you moving?</Label>
              <Textarea
                rows={4}
                value={cargoDescription}
                onChange={(e) => setCargoDescription(e.target.value)}
                placeholder="Describe items, quantity, and handling (at least 10 characters)"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  min={1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label>Dimensions</Label>
                <Input
                  value={cargoDimensions}
                  onChange={(e) => setCargoDimensions(e.target.value)}
                  placeholder="e.g. 2 pallets, 1.8m sofa"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Step 5 — Upload photos</h2>
          <p className="mb-4 text-sm text-slate-500">
            Optional — help drivers prepare the right vehicle. You can skip this step and
            continue without a photo.
          </p>
          <Input type="file" accept="image/*" disabled={uploading} onChange={onImageChange} />
          {uploading && <p className="mt-2 text-xs text-slate-400">Uploading…</p>}
          {cargoImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cargoImageUrl}
              alt="Cargo"
              className="mt-4 h-32 rounded-xl border border-slate-700 object-cover"
            />
          )}
        </section>
      )}

      {step === 5 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Step 6 — Delivery time</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDeliveryMode("immediate")}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                deliveryMode === "immediate" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300"
              }`}
            >
              Immediate
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMode("scheduled")}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                deliveryMode === "scheduled" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300"
              }`}
            >
              Scheduled
            </button>
          </div>
          {deliveryMode === "immediate" ? (
            <div className="mt-4">
              <Label>Urgency</Label>
              <Select value={urgency} onChange={(e) => setUrgency(e.target.value as DeliveryUrgency)}>
                <option value="EXPRESS">Express — ASAP</option>
                <option value="SAME_DAY">Same day</option>
                <option value="STANDARD">Standard (1–3 days)</option>
              </Select>
            </div>
          ) : (
            <div className="mt-4">
              <Label>Scheduled pickup</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          )}
        </section>
      )}

      {step === 6 && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Step 7 — Review & pay</h2>
          <dl className="space-y-2 text-sm text-slate-300">
            <div><dt className="text-slate-500">Pickup</dt><dd>{pickupAddress}, {pickupCity}</dd></div>
            {validStops.map((s, i) => (
              <div key={i}><dt className="text-slate-500">Stop {i + 1}</dt><dd>{s.address}, {s.city}</dd></div>
            ))}
            <div><dt className="text-slate-500">Drop-off</dt><dd>{dropoffAddress}, {dropoffCity}</dd></div>
            <div><dt className="text-slate-500">Vehicle</dt><dd>{vehicleType.replace(/_/g, " ")}</dd></div>
            <div><dt className="text-slate-500">Goods</dt><dd>{cargoDescription}</dd></div>
          </dl>
          <p className="mt-4 text-2xl font-bold text-amber-300">{formatZAR(estimate)}</p>
          {breakdown && <div className="mt-4"><PriceBreakdownCard breakdown={breakdown} /></div>}
          <Button
            type="button"
            className="mt-6 w-full"
            disabled={loading}
            onClick={createBooking}
          >
            {loading ? "Creating booking…" : "Confirm & proceed to payment"}
          </Button>
        </section>
      )}

      {step === 7 && reference && bookingId && (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <h2 className="text-xl font-bold text-white">Step 8 — Driver assignment</h2>
          <p className="mt-2 font-mono text-amber-400">{reference}</p>
          <p className="mt-3 text-slate-300">
            {paymentStatus === "INVOICED" || monthlyInvoicing
              ? "Booking created and added to your business account. Drivers will be notified — payment is included on your monthly invoice."
              : "Booking created. Complete payment to notify verified drivers in your area."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {paymentStatus !== "INVOICED" && !monthlyInvoicing && (
              <Link href={`/pay/checkout/${bookingId}`}>
                <Button>Pay now</Button>
              </Link>
            )}
            <Link href={`/track/${bookingId}`}>
              <Button variant="secondary">Track delivery</Button>
            </Link>
            {successBasePath && (
              <Link href={successBasePath}>
                <Button variant="ghost">Back to dashboard</Button>
              </Link>
            )}
          </div>
        </section>
      )}

      {error && <FieldError message={error} />}

      {step < 7 && (
        <div className="flex justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {step < 6 ? (
            <Button
              type="button"
              disabled={!canProceed()}
              onClick={() => setStep((s) => s + 1)}
              className="gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
