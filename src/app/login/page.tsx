import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const isBook = next === "/book";

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Sign in</h1>
      <p className="mt-2 text-slate-400">
        {isBook
          ? "Sign in with a customer account to book a delivery."
          : "Welcome back to FluxMove."}{" "}
        <Link href="/register?role=customer" className="text-amber-400 hover:underline">
          Create account
        </Link>
      </p>
      {isBook && (
        <p className="mt-2 text-xs text-amber-200/80">
          Demo customer: customer@demo.co.za / demo12345
        </p>
      )}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <Suspense fallback={<p className="text-slate-400">Loading…</p>}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </div>
  );
}
