import { CustomersTable, type AdminCustomerRow } from "@/components/admin/customers-table";
import { db } from "@/lib/db";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookingsAsCustomer: true } } },
  });

  const rows: AdminCustomerRow[] = customers.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    phone: c.phone,
    email: c.email,
    accountStatus: c.accountStatus,
    bookingCount: c._count.bookingsAsCustomer,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Customers</h1>
      <p className="mt-2 text-slate-400">Manage customer accounts and view their bookings.</p>
      <div className="mt-6">
        <CustomersTable customers={rows} />
      </div>
    </div>
  );
}
