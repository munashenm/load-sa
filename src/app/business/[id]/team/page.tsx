import { redirect } from "next/navigation";
import { BusinessShell } from "@/components/business/business-shell";
import { BusinessTeamPanel } from "@/components/business/business-team-panel";
import { requireUser } from "@/lib/auth";
import {
  canManageBusiness,
  getBusinessAccessForUser,
} from "@/lib/business-portal";

export default async function BusinessTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["CUSTOMER"], "/business");
  const { id } = await params;
  const access = await getBusinessAccessForUser(user.id, id);
  if (!access) redirect("/business/setup");

  return (
    <BusinessShell businessId={id} businessName={access.business.name}>
      <h1 className="text-2xl font-bold text-white">Team</h1>
      <p className="mt-2 text-slate-400">
        Invite colleagues to book and manage deliveries under {access.business.name}.
      </p>
      <div className="mt-8 max-w-2xl">
        <BusinessTeamPanel
          businessId={id}
          canManage={canManageBusiness(access.role)}
        />
      </div>
    </BusinessShell>
  );
}
