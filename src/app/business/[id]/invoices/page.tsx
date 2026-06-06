import { redirect } from "next/navigation";
import { BusinessShell } from "@/components/business/business-shell";
import { BusinessInvoicesPanel } from "@/components/business/business-invoices-panel";
import { requireUser } from "@/lib/auth";
import {
  canManageBusiness,
  getBusinessAccessForUser,
} from "@/lib/business-portal";
import { db } from "@/lib/db";

export default async function BusinessInvoicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["CUSTOMER"], "/business");
  const { id } = await params;
  const access = await getBusinessAccessForUser(user.id, id);
  if (!access) redirect("/business/setup");

  const invoices = await db.businessInvoice.findMany({
    where: { businessAccountId: id },
    orderBy: { periodEnd: "desc" },
  });

  return (
    <BusinessShell businessId={id} businessName={access.business.name}>
      <h1 className="text-2xl font-bold text-white">Invoices</h1>
      <p className="mt-2 text-slate-400">
        {access.business.monthlyInvoicing
          ? "Monthly consolidated invoices for your business deliveries."
          : "Enable monthly invoicing in settings to consolidate billing."}
      </p>
      <div className="mt-8 max-w-2xl">
        <BusinessInvoicesPanel
          businessId={id}
          canManage={canManageBusiness(access.role)}
          monthlyInvoicing={access.business.monthlyInvoicing}
          initialInvoices={invoices.map((inv) => ({
            id: inv.id,
            reference: inv.reference,
            periodStart: inv.periodStart.toISOString(),
            periodEnd: inv.periodEnd.toISOString(),
            totalAmount: inv.totalAmount,
            status: inv.status,
            dueAt: inv.dueAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </BusinessShell>
  );
}
