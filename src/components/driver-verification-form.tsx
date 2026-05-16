"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  LOAD_PREFERENCE_OPTIONS,
  MAJOR_CITIES,
  SA_PROVINCES,
  VEHICLE_OPTIONS,
} from "@/lib/sa-data";
import type { SAProvince } from "@/lib/sa-data";

export function DriverVerificationForm({
  defaultProvince = "Gauteng",
}: {
  defaultProvince?: string;
}) {
  const router = useRouter();
  const [province, setProvince] = useState(defaultProvince);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cities = MAJOR_CITIES[province as SAProvince] ?? [];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const profile = {
      idNumber: form.get("idNumber"),
      licenseNumber: form.get("licenseNumber"),
      province: form.get("province"),
      city: form.get("city"),
      bio: form.get("bio"),
      loadPreference: form.get("loadPreference"),
    };
    const vehicle = {
      type: form.get("vehicleType"),
      make: form.get("make"),
      model: form.get("model"),
      registration: form.get("registration"),
      maxWeightKg: form.get("maxWeightKg"),
      hasTrailer: form.get("hasTrailer") === "on",
    };

    const res = await fetch("/api/driver/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, vehicle }),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Could not submit verification. Check all required fields.");
      return;
    }

    router.push("/driver");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="mb-4 text-lg font-semibold">Identity & licence</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="idNumber">SA ID or passport</Label>
            <Input id="idNumber" name="idNumber" required />
          </div>
          <div>
            <Label htmlFor="licenseNumber">Driver licence number</Label>
            <Input id="licenseNumber" name="licenseNumber" required />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="mb-4 text-lg font-semibold">Operating area</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="province">Home province</Label>
            <Select
              id="province"
              name="province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            >
              {SA_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="city">City / town</Label>
            <Select id="city" name="city" required defaultValue="">
              <option value="" disabled>
                Select city
              </option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="loadPreference">Load preference</Label>
            <Select id="loadPreference" name="loadPreference" defaultValue="ANY">
              {LOAD_PREFERENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label} — {o.description}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="bio">About you (optional)</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={2}
              placeholder="Routes you run, years experience, cross-border, etc."
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="mb-4 text-lg font-semibold">Primary vehicle</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="vehicleType">Vehicle type</Label>
            <Select id="vehicleType" name="vehicleType" defaultValue="BAKKIE">
              {VEHICLE_OPTIONS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="make">Make</Label>
            <Input id="make" name="make" placeholder="Toyota" />
          </div>
          <div>
            <Label htmlFor="model">Model</Label>
            <Input id="model" name="model" placeholder="Hilux" />
          </div>
          <div>
            <Label htmlFor="registration">Registration</Label>
            <Input id="registration" name="registration" required />
          </div>
          <div>
            <Label htmlFor="maxWeightKg">Max load (kg)</Label>
            <Input id="maxWeightKg" name="maxWeightKg" type="number" min={1} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              id="hasTrailer"
              name="hasTrailer"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-600"
            />
            <Label htmlFor="hasTrailer">Trailer attached</Label>
          </div>
        </div>
      </section>

      <p className="text-sm text-slate-400">
        Submissions are reviewed manually (POPIA-compliant). You will be notified once
        verified — typically within 24–48 hours.
      </p>

      {error && <FieldError message={error} />}
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting…" : "Submit for verification"}
      </Button>
    </form>
  );
}
