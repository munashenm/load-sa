import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Sign in</h1>
      <p className="mt-2 text-slate-400">
        Welcome back to Load SA.{" "}
        <Link href="/register" className="text-amber-400 hover:underline">
          Create account
        </Link>
      </p>
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
