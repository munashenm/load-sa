import { redirect } from "next/navigation";
import { BusinessShell } from "@/components/business/business-shell";
import { BusinessBookingWizard } from "@/components/business/business-booking-wizard";
import { requireUser } from "@/lib/auth";
import { getBusinessAccessForUser } from "@/lib/business-portal";

export default async function BusinessBookPage({
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
      <h1 className="text-2xl font-bold text-white">New business booking</h1>
      <p className="mt-2 text-slate-400">
        {access.business.monthlyInvoicing
          ? "Deliveries will be added to your monthly invoice."
          : "Pay per delivery after confirmation."}
      </p>
      <div className="mt-8">
        <BusinessBookingWizard
          businessId={id}
          monthlyInvoicing={access.business.monthlyInvoicing}
        />
      </div>
    </BusinessShell>
  );
}
