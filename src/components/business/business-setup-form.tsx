"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select } from "@/components/ui/input";
import { SA_PROVINCES } from "@/lib/sa-data";

export function BusinessSetupForm({
  defaultEmail,
}: {
  defaultEmail: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/business/setup", {
      method: "POST",
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

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data.businessId) {
        router.push(`/business/${data.businessId}`);
        return;
      }
      setError(typeof data.error === "string" ? data.error : "Setup failed");
      return;
    }

    router.push(`/business/${data.business.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Company name</Label>
        <Input id="name" name="name" required placeholder="Acme Logistics (Pty) Ltd" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="registrationNumber">Company registration (optional)</Label>
          <Input id="registrationNumber" name="registrationNumber" />
        </div>
        <div>
          <Label htmlFor="vatNumber">VAT number (optional)</Label>
          <Input id="vatNumber" name="vatNumber" />
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
            defaultValue={defaultEmail}
          />
        </div>
        <div>
          <Label htmlFor="billingPhone">Billing phone</Label>
          <Input id="billingPhone" name="billingPhone" placeholder="082 123 4567" />
        </div>
      </div>
      <div>
        <Label htmlFor="billingAddress">Billing address</Label>
        <Input id="billingAddress" name="billingAddress" placeholder="Street address" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="billingCity">City</Label>
          <Input id="billingCity" name="billingCity" />
        </div>
        <div>
          <Label htmlFor="billingProvince">Province</Label>
          <Select id="billingProvince" name="billingProvince" defaultValue="">
            <option value="">Select province</option>
            {SA_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-slate-800 p-4 text-sm text-slate-300">
        <input type="checkbox" name="monthlyInvoicing" className="mt-1" />
        <span>
          <span className="font-medium text-white">Enable monthly invoicing</span>
          <span className="mt-1 block text-slate-500">
            Book deliveries now and receive one consolidated invoice at month-end instead of
            paying per trip.
          </span>
        </span>
      </label>
      {error && <FieldError message={error} />}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account…" : "Create business account"}
      </Button>
    </form>
  );
}
