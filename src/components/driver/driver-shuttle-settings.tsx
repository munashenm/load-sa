"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function DriverShuttleSettings({
  defaults,
}: {
  defaults: {
    offersFreight: boolean;
    offersShuttle: boolean;
    pdpLicenceNumber?: string | null;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/driver/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        services: {
          offersFreight: fd.get("offersFreight") === "on",
          offersShuttle: fd.get("offersShuttle") === "on",
          pdpLicenceNumber: fd.get("pdpLicenceNumber") || undefined,
        },
      }),
    });
    setLoading(false);
    setMsg(res.ok ? "Saved." : "Could not save.");
    if (res.ok) router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-sky-800/40 bg-sky-950/20 p-5 space-y-4"
    >
      <h3 className="font-semibold text-white">Services you offer</h3>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          name="offersFreight"
          defaultChecked={defaults.offersFreight}
        />
        Freight & cargo delivery
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          name="offersShuttle"
          defaultChecked={defaults.offersShuttle}
        />
        Shuttle & private hire (passengers)
      </label>
      <div>
        <Label htmlFor="pdpLicenceNumber">PDP licence number (required for passengers)</Label>
        <Input
          id="pdpLicenceNumber"
          name="pdpLicenceNumber"
          defaultValue={defaults.pdpLicenceNumber ?? ""}
          placeholder="Professional driving permit"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save services"}
      </Button>
      {msg && <p className="text-sm text-slate-400">{msg}</p>}
    </form>
  );
}
