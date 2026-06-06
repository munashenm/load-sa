"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select } from "@/components/ui/input";
import { SA_PROVINCES } from "@/lib/sa-data";

type BusinessData = {
  name: string;
  registrationNumber: string | null;
  vatNumber: string | null;
  billingEmail: string;
  billingPhone: string | null;
  billingAddress: string | null;
  billingCity: string | null;
  billingProvince: string | null;
  monthlyInvoicing: boolean;
};

export function BusinessSettingsForm({
  businessId,
  initial,
}: {
  businessId: string;
  initial: BusinessData;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch(`/api/business/${businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        registrationNumber: form.get("registrationNumber") || undefined,
        vatNumber: form.get("vatNumber") || undefined,
        billingEmail: form.get("billingEmail"),
        billingPhone: form.get("billingPhone") || undefined,
        billingAddress: form.get("billingAddress") || undefined,
        billingCity: form.get("billingCity") || undefined,
        billingProvince: form.get("billingProvince") || undefined,
        monthlyInvoicing: form.get("monthlyInvoicing") === "on",
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not save settings");
      return;
    }
    setSuccess(true);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <div>
        <Label htmlFor="name">Company name</Label>
        <Input id="name" name="name" required defaultValue={initial.name} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="registrationNumber">Registration number</Label>
          <Input
            id="registrationNumber"
            name="registrationNumber"
            defaultValue={initial.registrationNumber ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="vatNumber">VAT number</Label>
          <Input id="vatNumber" name="vatNumber" defaultValue={initial.vatNumber ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="billingEmail">Billing email</Label>
          <Input
            id="billingEmail"
            name="billingEmail"
            type="email"
            required
            defaultValue={initial.billingEmail}
          />
        </div>
        <div>
          <Label htmlFor="billingPhone">Billing phone</Label>
          <Input
            id="billingPhone"
            name="billingPhone"
            defaultValue={initial.billingPhone ?? ""}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="billingAddress">Billing address</Label>
        <Input
          id="billingAddress"
          name="billingAddress"
          defaultValue={initial.billingAddress ?? ""}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="billingCity">City</Label>
          <Input id="billingCity" name="billingCity" defaultValue={initial.billingCity ?? ""} />
        </div>
        <div>
          <Label htmlFor="billingProvince">Province</Label>
          <Select
            id="billingProvince"
            name="billingProvince"
            defaultValue={initial.billingProvince ?? ""}
          >
            <option value="">Select province</option>
            {SA_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-slate-800 p-4 text-sm">
        <input
          type="checkbox"
          name="monthlyInvoicing"
          defaultChecked={initial.monthlyInvoicing}
          className="mt-1"
        />
        <span className="text-slate-300">
          Monthly invoicing — consolidate deliveries into one invoice at month-end
        </span>
      </label>
      {error && <FieldError message={error} />}
      {success && (
        <p className="text-sm text-emerald-400">Settings saved.</p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
