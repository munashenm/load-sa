import { redirect } from "next/navigation";
import { BusinessShell } from "@/components/business/business-shell";
import { BulkBookingForm } from "@/components/business/bulk-booking-form";
import { requireUser } from "@/lib/auth";
import { getBusinessAccessForUser } from "@/lib/business-portal";

export default async function BusinessBulkPage({
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
      <h1 className="text-2xl font-bold text-white">Bulk bookings</h1>
      <p className="mt-2 text-slate-400">
        Upload multiple scheduled deliveries for warehouses, retail routes, or recurring runs.
      </p>
      <div className="mt-8 max-w-3xl">
        <BulkBookingForm businessId={id} />
      </div>
    </BusinessShell>
  );
}
