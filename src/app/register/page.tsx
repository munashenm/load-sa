import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const hint =
    params.role === "driver"
      ? "Register as a driver to earn on your routes."
      : params.role === "customer"
        ? "Register to book deliveries nationwide."
        : "Join as a customer or verified driver.";

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Get started</h1>
      <p className="mt-2 text-slate-400">
        {hint}{" "}
        <Link href="/login?next=/book" className="text-amber-400 hover:underline">
          Sign in
        </Link>
      </p>
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <Suspense fallback={<p className="text-slate-400">Loading…</p>}>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </div>
  );
}
