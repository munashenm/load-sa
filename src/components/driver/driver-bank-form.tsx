"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function DriverBankForm({
  defaults,
}: {
  defaults: {
    bankAccountHolder?: string | null;
    bankName?: string | null;
    bankAccountNumber?: string | null;
    bankBranchCode?: string | null;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/driver/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bank: {
          bankAccountHolder: fd.get("bankAccountHolder"),
          bankName: fd.get("bankName"),
          bankAccountNumber: fd.get("bankAccountNumber"),
          bankBranchCode: fd.get("bankBranchCode"),
        },
      }),
    });
    setLoading(false);
    setMsg(res.ok ? "Bank details saved." : "Could not save.");
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-800 p-5">
      <h3 className="font-semibold text-white">Bank details for payouts</h3>
      <div>
        <Label htmlFor="bankAccountHolder">Account holder</Label>
        <Input
          id="bankAccountHolder"
          name="bankAccountHolder"
          defaultValue={defaults.bankAccountHolder ?? ""}
          required
        />
      </div>
      <div>
        <Label htmlFor="bankName">Bank name</Label>
        <Input id="bankName" name="bankName" defaultValue={defaults.bankName ?? ""} required />
      </div>
      <div>
        <Label htmlFor="bankAccountNumber">Account number</Label>
        <Input
          id="bankAccountNumber"
          name="bankAccountNumber"
          defaultValue={defaults.bankAccountNumber ?? ""}
          required
        />
      </div>
      <div>
        <Label htmlFor="bankBranchCode">Branch code</Label>
        <Input
          id="bankBranchCode"
          name="bankBranchCode"
          defaultValue={defaults.bankBranchCode ?? ""}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save bank details"}
      </Button>
      {msg && <p className="text-sm text-slate-400">{msg}</p>}
    </form>
  );
}
