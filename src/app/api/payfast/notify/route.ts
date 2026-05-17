import { NextResponse } from "next/server";
import { applyOrderPricing } from "@/lib/platform";
import { verifyPayFastItn } from "@/lib/payfast";
import { db } from "@/lib/db";
import { generateDeliveryOtp } from "@/lib/smart-pricing";

export async function POST(request: Request) {
  const text = await request.text();
  const params = new URLSearchParams(text);
  const data: Record<string, string> = {};
  params.forEach((value, key) => {
    data[key] = value;
  });

  const signature = data.signature ?? "";
  if (!verifyPayFastItn(data, signature)) {
    return new NextResponse("INVALID", { status: 400 });
  }

  const paymentStatus = data.payment_status;
  const bookingId = data.custom_str1;
  const pfPaymentId = data.pf_payment_id ?? data.m_payment_id;

  if (!bookingId) {
    return new NextResponse("OK");
  }

  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return new NextResponse("OK");
  }

  if (paymentStatus === "COMPLETE") {
    const amount = parseFloat(data.amount_gross ?? String(booking.estimatedPrice));

    await db.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount,
        status: "PAID",
        provider: "PAYFAST",
        providerRef: pfPaymentId,
        paidAt: new Date(),
      },
      update: {
        status: "PAID",
        providerRef: pfPaymentId,
        paidAt: new Date(),
        amount,
      },
    });

    await db.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "PAID",
        deliveryOtp: generateDeliveryOtp(),
      },
    });

    await applyOrderPricing(bookingId, amount);
  } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
    await db.payment.updateMany({
      where: { bookingId },
      data: { status: "FAILED" },
    });
    await db.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: "FAILED" },
    });
  }

  return new NextResponse("OK");
}
