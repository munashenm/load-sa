"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

type Mode = "login" | "register";

function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

function pathForRole(role: string, next: string | null): string {
  const safe = safeNextPath(next);
  if (safe) return safe;
  if (role === "DRIVER") return "/driver";
  if (role === "ADMIN") return "/admin";
  return "/customer";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload =
      mode === "login"
        ? {
            email: form.get("email"),
            password: form.get("password"),
          }
        : {
            email: form.get("email"),
            password: form.get("password"),
            fullName: form.get("fullName"),
            phone: form.get("phone"),
            role: form.get("role"),
          };

    const res = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "Could not complete sign in. Check your details.",
      );
      return;
    }

    const dest = pathForRole(data.user.role, next);
    if (data.user.role !== "CUSTOMER" && safeNextPath(next) === "/book") {
      setError("Book deliveries with a customer account. Drivers use the driver hub.");
      return;
    }

    router.push(dest);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "register" && (
        <>
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required />
          </div>
          <div>
            <Label htmlFor="phone">Mobile (SA)</Label>
            <Input id="phone" name="phone" placeholder="082 123 4567" required />
          </div>
          <div>
            <Label htmlFor="role">I am a</Label>
            <select
              id="role"
              name="role"
              required
              defaultValue={
                searchParams.get("role") === "driver" ? "DRIVER" : "CUSTOMER"
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100"
            >
              <option value="CUSTOMER">Customer — book a delivery</option>
              <option value="DRIVER">Driver — earn on my routes</option>
            </select>
          </div>
        </>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
          required
        />
      </div>

      {error && <FieldError message={error} />}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
