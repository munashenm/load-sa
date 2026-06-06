import { redirect } from "next/navigation";
import { PayFastAutoSubmitForm } from "@/components/payfast-form";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildPayFastPaymentFields, getPayFastConfig } from "@/lib/payfast";
import { formatZAR } from "@/lib/sa-data";

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

  if (!getPayFastConfig()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-red-400">PayFast is not configured on this server.</p>
      </div>
    );
  }

  const payment = buildPayFastPaymentFields({
    bookingId: id,
    reference: booking.reference,
    amount: booking.estimatedPrice,
    customerEmail: booking.customer.email,
    customerName: booking.customer.fullName,
    itemName: `FluxMove delivery ${booking.reference}`,
  });

  if (!payment) {
    redirect("/book");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-white">Redirecting to PayFast</h1>
      <p className="mt-2 text-slate-400">
        Pay {formatZAR(booking.estimatedPrice)} securely. Please wait…
      </p>
      <PayFastAutoSubmitForm action={payment.action} fields={payment.fields} />
    </div>
  );
}
