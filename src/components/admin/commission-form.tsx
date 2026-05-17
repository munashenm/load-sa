"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function CommissionForm({ initial }: { initial: number }) {
  const router = useRouter();
  const [value, setValue] = useState(String(initial));
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commissionPercent: Number(value) }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-3">
      <div>
        <Label htmlFor="commission">Update %</Label>
        <Input
          id="commission"
          type="number"
          min={5}
          max={40}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24"
        />
      </div>
      <Button type="submit" disabled={loading} className="!py-2">
        {loading ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
