import { redirect } from "next/navigation";
import { BusinessSetupForm } from "@/components/business/business-setup-form";
import { requireUser } from "@/lib/auth";
import { getPrimaryBusinessForUser } from "@/lib/business-portal";

export default async function BusinessSetupPage() {
  const user = await requireUser(["CUSTOMER"], "/business/setup");
  const existing = await getPrimaryBusinessForUser(user.id);
  if (existing) {
    redirect(`/business/${existing.business.id}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Business account setup</h1>
      <p className="mt-2 text-slate-400">
        Create your company profile for bulk bookings, team access, and monthly invoicing.
      </p>
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <BusinessSetupForm defaultEmail={user.email} />
      </div>
    </div>
  );
}
