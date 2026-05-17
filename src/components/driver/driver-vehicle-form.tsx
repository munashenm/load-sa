"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { VEHICLE_OPTIONS } from "@/lib/sa-data";
import { VehicleIcon } from "@/lib/vehicle-icons";
import type { VehicleType } from "@/lib/types";

export function DriverVehicleForm({
  vehicle,
}: {
  vehicle: {
    type: string;
    make?: string | null;
    model?: string | null;
    registration: string;
    maxWeightKg?: number | null;
    insuranceStatus?: string | null;
  } | null;
}) {
  const router = useRouter();
  const [type, setType] = useState(vehicle?.type ?? "CAR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/driver/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicle: {
          type: fd.get("type"),
          make: fd.get("make") || undefined,
          model: fd.get("model") || undefined,
          registration: fd.get("registration"),
          maxWeightKg: fd.get("maxWeightKg")
            ? Number(fd.get("maxWeightKg"))
            : undefined,
          insuranceStatus: fd.get("insuranceStatus"),
        },
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not save vehicle details");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <Label htmlFor="type">Vehicle type</Label>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {VEHICLE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                type === opt.value
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-slate-800 hover:border-slate-600"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={opt.value}
                checked={type === opt.value}
                onChange={() => setType(opt.value)}
                className="sr-only"
              />
              <VehicleIcon type={opt.value} className="h-6 w-6 text-emerald-400" />
              <span className="text-sm text-white">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="make">Make</Label>
          <Input id="make" name="make" defaultValue={vehicle?.make ?? ""} />
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" defaultValue={vehicle?.model ?? ""} />
        </div>
        <div>
          <Label htmlFor="registration">Registration number</Label>
          <Input
            id="registration"
            name="registration"
            defaultValue={vehicle?.registration ?? ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="maxWeightKg">Load capacity (kg)</Label>
          <Input
            id="maxWeightKg"
            name="maxWeightKg"
            type="number"
            defaultValue={vehicle?.maxWeightKg ?? ""}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="insuranceStatus">Insurance status</Label>
          <Select
            id="insuranceStatus"
            name="insuranceStatus"
            defaultValue={vehicle?.insuranceStatus ?? "INSURED"}
          >
            <option value="INSURED">Insured</option>
            <option value="PENDING">Pending</option>
            <option value="NOT_INSURED">Not insured</option>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save vehicle"}
      </Button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
