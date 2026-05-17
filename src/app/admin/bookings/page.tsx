import { BookingsTable, type AdminBookingRow } from "@/components/admin/bookings-table";
import { db } from "@/lib/db";

export default async function AdminBookingsPage() {
  const [bookings, drivers] = await Promise.all([
    db.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        customer: { select: { fullName: true, email: true } },
        driver: { include: { user: { select: { fullName: true } } } },
      },
    }),
    db.driverProfile.findMany({
      where: {
        verificationStatus: "APPROVED",
        accountStatus: "ACTIVE",
      },
      include: { user: { select: { fullName: true } } },
    }),
  ]);

  const rows: AdminBookingRow[] = bookings.map((b) => ({
    id: b.id,
    reference: b.reference,
    status: b.status,
    vehicleType: b.vehicleType,
    estimatedPrice: b.estimatedPrice,
    finalPrice: b.finalPrice,
    createdAt: b.createdAt.toISOString(),
    pickupCity: b.pickupCity,
    dropoffCity: b.dropoffCity,
    customer: b.customer,
    driver: b.driver ? { id: b.driver.id, user: b.driver.user } : null,
  }));

  const driverOptions = drivers.map((d) => ({
    id: d.id,
    name: d.user.fullName,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Bookings</h1>
      <p className="mt-2 text-slate-400">
        Filter, assign drivers, update status, and view full booking details.
      </p>
      <div className="mt-6">
        <BookingsTable bookings={rows} drivers={driverOptions} />
      </div>
    </div>
  );
}
