import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { buildPayFastPaymentFields, getPayFastConfig } from "@/lib/payfast";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  const { id } = await params;

  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Customer only" }, { status: 403 });
  }

  const booking = await db.booking.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!booking || booking.customerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (booking.paymentStatus === "PAID") {
    return NextResponse.json({ error: "Already paid" }, { status: 400 });
  }

  const config = getPayFastConfig();
  if (!config) {
    return NextResponse.json(
      {
        error:
          "PayFast not configured. Set PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, NEXT_PUBLIC_APP_URL.",
      },
      { status: 503 },
    );
  }

  const amount = booking.estimatedPrice;

  await db.payment.upsert({
    where: { bookingId: id },
    create: {
      bookingId: id,
      amount,
      status: "PENDING",
      provider: "PAYFAST",
    },
    update: { status: "PENDING", amount },
  });

  const payment = buildPayFastPaymentFields({
    bookingId: id,
    reference: booking.reference,
    amount,
    customerEmail: booking.customer.email,
    customerName: booking.customer.fullName,
    itemName: `Load SA ${booking.reference}`,
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment setup failed" }, { status: 500 });
  }

  return NextResponse.json({
    checkoutUrl: `/pay/checkout/${id}`,
    payfast: payment,
  });
}
