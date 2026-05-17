import { SupportForm } from "@/components/support-form";
import { requireUser } from "@/lib/auth";

export default async function SupportPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold text-white">Support</h1>
      <p className="mt-2 text-slate-400">
        We will respond via email. Admins see tickets in the dashboard.
      </p>
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <SupportForm />
      </div>
    </div>
  );
}
