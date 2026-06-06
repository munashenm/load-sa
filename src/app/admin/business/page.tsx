import { db } from "@/lib/db";
import { BusinessAccountsTable } from "@/components/admin/business-accounts-table";

export default async function AdminBusinessPage() {
  const accounts = await db.businessAccount.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { fullName: true } },
      _count: { select: { members: true, bookings: true } },
    },
  });

  const rows = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    billingEmail: a.billingEmail,
    billingCity: a.billingCity,
    monthlyInvoicing: a.monthlyInvoicing,
    status: a.status,
    memberCount: a._count.members,
    bookingCount: a._count.bookings,
    ownerName: a.owner.fullName,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Business accounts</h1>
      <p className="mt-2 text-slate-400">
        Manage B2B customers — bulk booking, invoicing, and team access.
      </p>
      <div className="mt-8">
        <BusinessAccountsTable accounts={rows} />
      </div>
    </div>
  );
}
