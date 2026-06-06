import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  initializePaystackTransaction,
  isPaystackConfigured,
} from "@/lib/paystack";

export default async function PayCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["CUSTOMER"]);
  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!booking || booking.customerId !== user.id) {
    redirect("/book");
  }

  if (booking.paymentStatus === "PAID") {
    redirect(`/track/${id}`);
  }

  if (!isPaystackConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-red-400">Paystack is not configured on this server.</p>
      </div>
    );
  }

  const init = await initializePaystackTransaction({
    bookingId: id,
    reference: booking.reference,
    amount: booking.estimatedPrice,
    customerEmail: booking.customer.email,
    itemName: `FluxMove delivery ${booking.reference}`,
  });

  if ("error" in init) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-red-400">{init.error}</p>
      </div>
    );
  }

  await db.payment.upsert({
    where: { bookingId: id },
    create: {
      bookingId: id,
      amount: booking.estimatedPrice,
      status: "PENDING",
      provider: "PAYSTACK",
      providerRef: init.reference,
    },
    update: {
      status: "PENDING",
      amount: booking.estimatedPrice,
      provider: "PAYSTACK",
      providerRef: init.reference,
    },
  });

  redirect(init.authorizationUrl);
}
