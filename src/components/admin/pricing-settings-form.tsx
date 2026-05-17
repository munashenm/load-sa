"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  DEFAULT_PRICING_CONFIG,
  type PricingConfig,
  type VehicleRate,
} from "@/lib/pricing-config";
import { VEHICLE_OPTIONS } from "@/lib/sa-data";
import type { VehicleType } from "@/lib/types";

export function PricingSettingsForm({ initial }: { initial: PricingConfig }) {
  const router = useRouter();
  const [config, setConfig] = useState<PricingConfig>(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function setVehicleRate(type: VehicleType, field: keyof VehicleRate, value: number) {
    setConfig((c) => ({
      ...c,
      vehicleRates: {
        ...c.vehicleRates,
        [type]: { ...c.vehicleRates[type], [field]: value },
      },
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setLoading(false);
    if (res.ok) {
      setMessage("Pricing saved.");
      router.refresh();
    } else {
      setMessage("Could not save pricing.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="text-lg font-semibold text-white">Global fees</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="baseFee">Base fee (ZAR)</Label>
            <Input
              id="baseFee"
              type="number"
              min={0}
              value={config.baseFee}
              onChange={(e) =>
                setConfig((c) => ({ ...c, baseFee: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <Label htmlFor="pricePerKm">Default price per km (ZAR)</Label>
            <Input
              id="pricePerKm"
              type="number"
              min={0}
              step={0.5}
              value={config.pricePerKm}
              onChange={(e) =>
                setConfig((c) => ({ ...c, pricePerKm: Number(e.target.value) }))
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="text-lg font-semibold text-white">Urgent delivery surcharge</h2>
        <p className="mt-1 text-sm text-slate-400">Percentage added to the fare</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sameDay">Same-day surcharge (%)</Label>
            <Input
              id="sameDay"
              type="number"
              min={0}
              value={config.sameDaySurchargePct}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  sameDaySurchargePct: Number(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="express">Express surcharge (%)</Label>
            <Input
              id="express"
              type="number"
              min={0}
              value={config.expressSurchargePct}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  expressSurchargePct: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="text-lg font-semibold text-white">Price per vehicle type</h2>
        <div className="mt-4 space-y-4">
          {VEHICLE_OPTIONS.map((v) => (
            <div
              key={v.value}
              className="grid gap-3 rounded-xl border border-slate-800/80 p-4 sm:grid-cols-3"
            >
              <p className="font-medium text-slate-200 sm:col-span-1">{v.label}</p>
              <div>
                <Label>Base fare (ZAR)</Label>
                <Input
                  type="number"
                  min={0}
                  value={config.vehicleRates[v.value].base}
                  onChange={(e) =>
                    setVehicleRate(v.value, "base", Number(e.target.value))
                  }
                />
              </div>
              <div>
                <Label>Per km (ZAR)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={config.vehicleRates[v.value].perKm}
                  onChange={(e) =>
                    setVehicleRate(v.value, "perKm", Number(e.target.value))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save pricing"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setConfig(initial ?? DEFAULT_PRICING_CONFIG)}
        >
          Reset form
        </Button>
        {message && <p className="text-sm text-emerald-400">{message}</p>}
      </div>
    </form>
  );
}
