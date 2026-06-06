"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddressAutocomplete } from "@/components/maps/address-autocomplete";
import { PriceBreakdownCard } from "@/components/pricing/price-breakdown";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { SA_PROVINCES, formatZAR } from "@/lib/sa-data";
import type { SAProvince } from "@/lib/sa-data";
import {
  SA_AIRPORTS as AIRPORTS,
  SHUTTLE_TRIP_OPTIONS as TRIPS,
  SHUTTLE_VEHICLE_OPTIONS as VEHICLES,
} from "@/lib/shuttle-data";
import type { DeliveryUrgency, ShuttleTripType, ShuttleVehicleClass } from "@/lib/types";
import type { PriceBreakdown } from "@/lib/smart-pricing";

export function ShuttleBookingForm() {
  const router = useRouter();
  const [tripType, setTripType] = useState<ShuttleTripType>("AIRPORT_DROPOFF");
  const [vehicleClass, setVehicleClass] = useState<ShuttleVehicleClass>("SEDAN");
  const [pickupProvince, setPickupProvince] = useState("Gauteng");
  const [dropoffProvince, setDropoffProvince] = useState("Gauteng");
  const [airportCode, setAirportCode] = useState("ORT");
  const [passengers, setPassengers] = useState("2");
  const [luggage, setLuggage] = useState("2");
  const [hireHours, setHireHours] = useState("3");
  const [urgency, setUrgency] = useState<DeliveryUrgency>("STANDARD");
  const [isNight, setIsNight] = useState(false);
  const [pickupCity, setPickupCity] = useState("Sandton");
  const [dropoffCity, setDropoffCity] = useState("Kempton Park");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [pickupLat, setPickupLat] = useState<number | undefined>();
  const [pickupLng, setPickupLng] = useState<number | undefined>();
  const [dropoffLat, setDropoffLat] = useState<number | undefined>();
  const [dropoffLng, setDropoffLng] = useState<number | undefined>();
  const [estimate, setEstimate] = useState(0);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAirportTrip =
    tripType === "AIRPORT_PICKUP" || tripType === "AIRPORT_DROPOFF";
  const isHourly = tripType === "PRIVATE_HIRE_HOURLY";

  useEffect(() => {
    const airport = AIRPORTS.find((a) => a.code === airportCode);
    if (tripType === "AIRPORT_DROPOFF" && airport) {
      setDropoffCity(airport.city);
      setDropoffProvince(airport.province as SAProvince);
    }
    if (tripType === "AIRPORT_PICKUP" && airport) {
      setPickupCity(airport.city);
      setPickupProvince(airport.province as SAProvince);
    }
  }, [airportCode, tripType]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await fetch("/api/pricing/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "SHUTTLE",
          shuttleTripType: tripType,
          shuttleVehicleClass: vehicleClass,
          pickupCity,
          pickupProvince,
          dropoffCity,
          dropoffProvince,
          airportCode: isAirportTrip ? airportCode : undefined,
          passengerCount: Number(passengers) || 1,
          luggagePieces: Number(luggage) || 0,
          hireHours: isHourly ? Number(hireHours) : undefined,
          urgency,
          isNightDelivery: isNight,
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
    tripType,
    vehicleClass,
    pickupCity,
    pickupProvince,
    dropoffCity,
    dropoffProvince,
    airportCode,
    passengers,
    luggage,
    hireHours,
    urgency,
    isNight,
    isAirportTrip,
    isHourly,
  ]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = Object.fromEntries(fd.entries());
    body.pickupAddress = pickupAddress;
    body.pickupCity = pickupCity;
    body.pickupProvince = pickupProvince;
    body.pickupLat = pickupLat;
    body.pickupLng = pickupLng;
    if (isHourly) {
      body.dropoffAddress = pickupAddress;
      body.dropoffCity = pickupCity;
      body.dropoffProvince = pickupProvince;
      body.dropoffLat = pickupLat;
      body.dropoffLng = pickupLng;
    } else {
      body.dropoffAddress = dropoffAddress;
      body.dropoffCity = dropoffCity;
      body.dropoffProvince = dropoffProvince;
      body.dropoffLat = dropoffLat;
      body.dropoffLng = dropoffLng;
    }
    const res = await fetch("/api/bookings/shuttle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        shuttleTripType: tripType,
        shuttleVehicleClass: vehicleClass,
        airportCode: isAirportTrip ? airportCode : undefined,
        passengerCount: Number(passengers),
        luggagePieces: Number(luggage) || undefined,
        hireHours: isHourly ? Number(hireHours) : undefined,
        isNightDelivery: isNight,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError("Could not create booking. Check all fields.");
      return;
    }
    setSuccess(`Shuttle booking ${data.booking.reference} created.`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-sky-800/40 bg-sky-950/20 p-5">
        <h2 className="text-lg font-semibold text-white">Trip type</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {TRIPS.map((t) => (
            <label
              key={t.value}
              className={`cursor-pointer rounded-xl border px-4 py-3 transition ${
                tripType === t.value
                  ? "border-sky-500/50 bg-sky-500/10"
                  : "border-slate-800 hover:border-slate-600"
              }`}
            >
              <input
                type="radio"
                name="tripTypeUi"
                className="sr-only"
                checked={tripType === t.value}
                onChange={() => setTripType(t.value)}
              />
              <span className="font-medium text-white">{t.label}</span>
              <p className="mt-1 text-xs text-slate-400">{t.description}</p>
            </label>
          ))}
        </div>
      </section>

      {isAirportTrip && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <Label htmlFor="airportCode">Airport</Label>
          <Select
            id="airportCode"
            value={airportCode}
            onChange={(e) => setAirportCode(e.target.value)}
          >
            {AIRPORTS.map((a) => (
              <option key={a.code} value={a.code}>
                {a.name}
              </option>
            ))}
          </Select>
          <div className="mt-4">
            <Label htmlFor="flightNumber">Flight number (optional)</Label>
            <Input id="flightNumber" name="flightNumber" placeholder="e.g. SA123" />
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Pickup</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="pickupAddress">Address</Label>
            <AddressAutocomplete
              id="pickupAddress"
              value={pickupAddress}
              onChange={setPickupAddress}
              onPlaceSelected={(place) => {
                setPickupAddress(place.address);
                setPickupCity(place.city);
                setPickupProvince(place.province);
                setPickupLat(place.lat);
                setPickupLng(place.lng);
              }}
              placeholder="Pickup street address"
              required
            />
          </div>
          <div>
            <Label htmlFor="pickupCity">City</Label>
            <Input
              id="pickupCity"
              name="pickupCity"
              value={pickupCity}
              onChange={(e) => setPickupCity(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Province</Label>
            <Select
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

      {!isHourly && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Drop-off</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="dropoffAddress">Address</Label>
              <AddressAutocomplete
                id="dropoffAddress"
                value={dropoffAddress}
                onChange={setDropoffAddress}
                onPlaceSelected={(place) => {
                  setDropoffAddress(place.address);
                  setDropoffCity(place.city);
                  setDropoffProvince(place.province);
                  setDropoffLat(place.lat);
                  setDropoffLng(place.lng);
                }}
                placeholder="Drop-off street address"
                required
              />
            </div>
            <div>
              <Label htmlFor="dropoffCity">City</Label>
              <Input
                id="dropoffCity"
                name="dropoffCity"
                value={dropoffCity}
                onChange={(e) => setDropoffCity(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Province</Label>
              <Select
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
      )}

      {isHourly && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <Label htmlFor="hireHours">Hours booked</Label>
          <Input
            id="hireHours"
            type="number"
            min={2}
            max={12}
            value={hireHours}
            onChange={(e) => setHireHours(e.target.value)}
          />
          <input type="hidden" name="dropoffAddress" value={pickupCity} />
          <input type="hidden" name="dropoffCity" value={pickupCity} />
          <input type="hidden" name="dropoffProvince" value={pickupProvince} />
        </section>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Vehicle & passengers</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Vehicle class</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {VEHICLES.map((v) => (
                <label
                  key={v.value}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                    vehicleClass === v.value
                      ? "border-sky-500/50 bg-sky-500/10 text-white"
                      : "border-slate-800 text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    checked={vehicleClass === v.value}
                    onChange={() => setVehicleClass(v.value)}
                  />
                  {v.label} — {v.description}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Passengers</Label>
            <Input
              type="number"
              min={1}
              max={16}
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
            />
          </div>
          <div>
            <Label>Luggage pieces</Label>
            <Input
              type="number"
              min={0}
              value={luggage}
              onChange={(e) => setLuggage(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="passengerNotes">Notes</Label>
            <Textarea
              id="passengerNotes"
              name="passengerNotes"
              rows={2}
              placeholder="Child seat, meet at arrivals, company name…"
            />
          </div>
          <div>
            <Label htmlFor="scheduledAt">Pickup date & time</Label>
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
          </div>
          <div>
            <Label>Urgency</Label>
            <Select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as DeliveryUrgency)}
            >
              <option value="STANDARD">Standard</option>
              <option value="SAME_DAY">Same day</option>
              <option value="EXPRESS">Express</option>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
            <input
              type="checkbox"
              checked={isNight}
              onChange={(e) => setIsNight(e.target.checked)}
            />
            After-hours pickup (20:00–06:00)
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Passenger trips require a verified driver with PDP. Fluxmove connects you with
          independent operators — not a taxi meter service.
        </p>
      </section>

      <div className="flex flex-col gap-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div>
            <p className="text-sm text-sky-200/80">Shuttle estimate</p>
            <p className="text-2xl font-bold text-sky-300">{formatZAR(estimate)}</p>
          </div>
          {breakdown && (
            <div className="w-full sm:max-w-sm">
              <PriceBreakdownCard breakdown={breakdown} />
            </div>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Booking…" : "Book shuttle"}
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
