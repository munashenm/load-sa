import { notFound } from "next/navigation";
import { DeliveryDetailPanel } from "@/components/driver/delivery-detail-panel";
import { requireUser } from "@/lib/auth";
import { maskContactForBooking } from "@/lib/chat-access";
import { getDriverProfileForUser } from "@/lib/driver-portal";
import { db } from "@/lib/db";

export default async function DriverDeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(["DRIVER"]);
  const profile = await getDriverProfileForUser(user.id);
  if (!profile) return null;

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      customer: { select: { fullName: true, phone: true } },
      proofs: true,
    },
  });

  if (!booking || booking.driverId !== profile.id) {
    notFound();
  }

  const customer = maskContactForBooking(
    booking.customer,
    "DRIVER",
    booking.paymentStatus,
    false,
  );

  const hasPickupProof = booking.proofs.some((p) => p.type === "PICKUP_PROOF");
  const hasDeliveryProof = booking.proofs.some(
    (p) => p.type === "DELIVERY_PROOF",
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Delivery {booking.reference}</h1>
      <p className="mt-2 text-slate-400">
        {booking.pickupAddress}, {booking.pickupCity} → {booking.dropoffAddress},{" "}
        {booking.dropoffCity}
      </p>
      <div className="mt-8 max-w-xl">
        <DeliveryDetailPanel
          bookingId={booking.id}
          reference={booking.reference}
          status={booking.status}
          pickupCity={booking.pickupCity}
          dropoffCity={booking.dropoffCity}
          paymentStatus={booking.paymentStatus}
          hasPickupProof={hasPickupProof}
          hasDeliveryProof={hasDeliveryProof}
          customerName={customer?.fullName ?? "Customer"}
          customerPhone={customer?.phone ?? "—"}
        />
      </div>
    </div>
  );
}
