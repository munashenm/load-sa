import { db } from "@/lib/db";
import { sendDeliveryOtpMessage } from "@/lib/messaging";
import { generateDeliveryOtp } from "@/lib/smart-pricing";

export async function completeBookingPayment(
  bookingId: string,
  paidAmount: number,
  providerRef: string,
): Promise<boolean> {
  const result = await db.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        reference: true,
        customerId: true,
        paymentStatus: true,
        deliveryOtp: true,
      },
    });

    if (!booking) return null;
    if (booking.paymentStatus === "PAID") return { alreadyPaid: true as const };

    const deliveryOtp = booking.deliveryOtp ?? generateDeliveryOtp();
    const now = new Date();

    await tx.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "PAID",
        finalPrice: paidAmount,
        deliveryOtp,
      },
    });

    await tx.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount: paidAmount,
        status: "PAID",
        provider: "PAYSTACK",
        providerRef,
        paidAt: now,
      },
      update: {
        amount: paidAmount,
        status: "PAID",
        provider: "PAYSTACK",
        providerRef,
        paidAt: now,
      },
    });

    await tx.notification.create({
      data: {
        userId: booking.customerId,
        bookingId: booking.id,
        type: "PAYMENT_COMPLETE",
        title: "Payment received",
        message: `Your payment for ${booking.reference} was successful. Share your delivery OTP with the driver when you receive your goods.`,
      },
    });

    return {
      alreadyPaid: false as const,
      customerId: booking.customerId,
      reference: booking.reference,
      deliveryOtp,
    };
  });

  if (!result || result.alreadyPaid) return Boolean(result);

  await sendDeliveryOtpMessage(
    result.customerId,
    result.reference,
    result.deliveryOtp,
    bookingId,
  );

  return true;
}
