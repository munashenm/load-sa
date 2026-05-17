import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingSummaryCard } from "@/components/booking-summary";
import { StatusBadge } from "@/components/status-badge";
import { db } from "@/lib/db";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await db.user.findFirst({
    where: { id, role: "CUSTOMER" },
    include: {
      bookingsAsCustomer: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!customer) notFound();

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-amber-400 hover:underline">
        ← Back to customers
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">{customer.fullName}</h1>
      <p className="text-slate-400">
        {customer.email} · {customer.phone}
      </p>
      <div className="mt-2">
        <StatusBadge
          label={customer.accountStatus === "BLOCKED" ? "Blocked" : "Active"}
          tone={customer.accountStatus === "BLOCKED" ? "red" : "green"}
        />
      </div>

      <h2 className="mt-8 text-lg font-semibold text-white">Bookings</h2>
      <ul className="mt-4 space-y-3">
        {customer.bookingsAsCustomer.map((b) => (
          <li key={b.id}>
            <BookingSummaryCard booking={b} detailHref={`/admin/bookings/${b.id}`} />
          </li>
        ))}
        {customer.bookingsAsCustomer.length === 0 && (
          <p className="text-slate-500">No bookings yet.</p>
        )}
      </ul>
    </div>
  );
}
