import { redirect } from "next/navigation";
import { BusinessShell } from "@/components/business/business-shell";
import { BusinessSettingsForm } from "@/components/business/business-settings-form";
import { requireUser } from "@/lib/auth";
import {
  canManageBusiness,
  getBusinessAccessForUser,
} from "@/lib/business-portal";

export default async function BusinessSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["CUSTOMER"], "/business");
  const { id } = await params;
  const access = await getBusinessAccessForUser(user.id, id);
  if (!access) redirect("/business/setup");
  if (!canManageBusiness(access.role)) {
    redirect(`/business/${id}`);
  }

  return (
    <BusinessShell businessId={id} businessName={access.business.name}>
      <h1 className="text-2xl font-bold text-white">Business settings</h1>
      <p className="mt-2 text-slate-400">Company profile and billing preferences.</p>
      <div className="mt-8">
        <BusinessSettingsForm businessId={id} initial={access.business} />
      </div>
    </BusinessShell>
  );
}
