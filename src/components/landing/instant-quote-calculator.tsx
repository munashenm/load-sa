"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Truck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { PriceBreakdownCard } from "@/components/pricing/price-breakdown";
import { AddressAutocomplete } from "@/components/maps/address-autocomplete";
import { VEHICLE_CATEGORIES } from "@/lib/vehicle-categories";
import { SA_PROVINCES, formatZAR } from "@/lib/sa-data";
import { VehicleIcon } from "@/lib/vehicle-icons";
import type { DeliveryUrgency, VehicleType } from "@/lib/types";
import type { PriceBreakdown } from "@/lib/smart-pricing";
import type { DeliveryTimeEstimate } from "@/lib/delivery-estimates";

type DeliveryMode = "immediate" | "scheduled";

export function InstantQuoteCalculator() {
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [dropoffCity, setDropoffCity] = useState("");
  const [pickupProvince, setPickupProvince] = useState("Gauteng");
  const [dropoffProvince, setDropoffProvince] = useState("Gauteng");
  const [pickupLat, setPickupLat] = useState<number | undefined>();
  const [pickupLng, setPickupLng] = useState<number | undefined>();
  const [dropoffLat, setDropoffLat] = useState<number | undefined>();
  const [dropoffLng, setDropoffLng] = useState<number | undefined>();
  const [vehicleType, setVehicleType] = useState<VehicleType>("BAKKIE");
  const [weightKg, setWeightKg] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("immediate");
  const [urgency, setUrgency] = useState<DeliveryUrgency>("SAME_DAY");
  const [scheduledAt, setScheduledAt] = useState("");
  const [estimate, setEstimate] = useState(0);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [times, setTimes] = useState<DeliveryTimeEstimate | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const effectiveUrgency =
      deliveryMode === "scheduled" ? "STANDARD" : urgency;

    const t = setTimeout(async () => {
      setLoading(true);
      const res = await fetch("/api/pricing/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleType,
          pickupProvince,
          dropoffProvince,
          pickupCity: pickupCity || undefined,
          dropoffCity: dropoffCity || undefined,
          pickupLat,
          pickupLng,
          dropoffLat,
          dropoffLng,
          weightKg: weightKg ? Number(weightKg) : undefined,
          urgency: effectiveUrgency,
          scheduledAt: deliveryMode === "scheduled" ? scheduledAt : undefined,
        }),
      });
      setLoading(false);
      if (res.ok) {
        const data = await res.json();
        setEstimate(data.total);
        setBreakdown(data.breakdown);
        setTimes(data.times ?? null);
      }
    }, 350);
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
  ]);

  const bookHref = `/register?role=customer&next=${encodeURIComponent("/book/freight")}`;

  return (
    <div
      id="quote"
      className="rounded-3xl border border-slate-700/80 bg-slate-900/90 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
          <Zap className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-white">Instant quote</h2>
          <p className="text-sm text-slate-400">Live pricing — no sign-in required</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="quote-pickup">Pickup address</Label>
            <AddressAutocomplete
              id="quote-pickup"
              value={pickupAddress}
              onChange={setPickupAddress}
              onPlaceSelected={(place) => {
                setPickupAddress(place.address);
                setPickupCity(place.city);
                setPickupProvince(place.province);
                setPickupLat(place.lat);
                setPickupLng(place.lng);
              }}
              placeholder="Street, suburb, or landmark"
            />
          </div>
          <div>
            <Label htmlFor="quote-pickup-province">Pickup province</Label>
            <Select
              id="quote-pickup-province"
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
          <div>
            <Label htmlFor="quote-dropoff">Delivery address</Label>
            <AddressAutocomplete
              id="quote-dropoff"
              value={dropoffAddress}
              onChange={setDropoffAddress}
              onPlaceSelected={(place) => {
                setDropoffAddress(place.address);
                setDropoffCity(place.city);
                setDropoffProvince(place.province);
                setDropoffLat(place.lat);
                setDropoffLng(place.lng);
              }}
              placeholder="Street, suburb, or landmark"
            />
          </div>
          <div>
            <Label htmlFor="quote-dropoff-province">Delivery province</Label>
            <Select
              id="quote-dropoff-province"
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
          <div>
            <Label htmlFor="quote-vehicle">Vehicle type</Label>
            <div className="flex items-center gap-2">
              <VehicleIcon type={vehicleType} className="h-5 w-5" />
              <Select
                id="quote-vehicle"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="flex-1"
              >
                {VEHICLE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.vehicleType}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="quote-weight">Estimated weight (kg)</Label>
            <Input
              id="quote-weight"
              type="number"
              min={1}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <Label>Delivery timing</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDeliveryMode("immediate")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  deliveryMode === "immediate"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Urgent / immediate
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode("scheduled")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  deliveryMode === "scheduled"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Scheduled
              </button>
            </div>
          </div>
          {deliveryMode === "immediate" ? (
            <div>
              <Label htmlFor="quote-urgency">Urgency</Label>
              <Select
                id="quote-urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as DeliveryUrgency)}
              >
                <option value="EXPRESS">Express — ASAP</option>
                <option value="SAME_DAY">Same day</option>
                <option value="STANDARD">Standard (1–3 days)</option>
              </Select>
            </div>
          ) : (
            <div>
              <Label htmlFor="quote-scheduled">Scheduled pickup</Label>
              <Input
                id="quote-scheduled"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-slate-900/50 p-5">
          <p className="text-sm font-medium text-amber-200/90">Your estimate</p>
          <p className="mt-1 text-4xl font-bold text-amber-300">
            {loading ? "…" : formatZAR(estimate)}
          </p>
          {breakdown && (
            <p className="mt-1 text-xs text-slate-500">
              ~{breakdown.distanceKm} km · distance, vehicle & urgency included
            </p>
          )}

          {times && (
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-start gap-2 text-slate-300">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  <span className="text-slate-500">Pickup: </span>
                  {times.pickupTime}
                </span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  <span className="text-slate-500">Delivery: </span>
                  {times.deliveryTime}
                </span>
              </li>
            </ul>
          )}

          {breakdown && (
            <div className="mt-4 flex-1">
              <PriceBreakdownCard breakdown={breakdown} />
            </div>
          )}

          <Link href={bookHref} className="mt-6 block">
            <Button className="w-full gap-2">
              <MapPin className="h-4 w-4" />
              Book this delivery
            </Button>
          </Link>
          <p className="mt-2 text-center text-xs text-slate-500">
            Create a free account to confirm and pay
          </p>
        </div>
      </div>
    </div>
  );
}
