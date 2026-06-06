import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import {
  initializePaystackTransaction,
  isPaystackConfigured,
} from "@/lib/paystack";

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

  if (!isPaystackConfigured()) {
    return NextResponse.json(
      {
        error:
          "Paystack not configured. Set PAYSTACK_SECRET_KEY and NEXT_PUBLIC_APP_URL.",
      },
      { status: 503 },
    );
  }

  const amount = booking.estimatedPrice;

  const init = await initializePaystackTransaction({
    bookingId: id,
    reference: booking.reference,
    amount,
    customerEmail: booking.customer.email,
    itemName: `FluxMove ${booking.reference}`,
  });

  if ("error" in init) {
    return NextResponse.json({ error: init.error }, { status: 502 });
  }

  await db.payment.upsert({
    where: { bookingId: id },
    create: {
      bookingId: id,
      amount,
      status: "PENDING",
      provider: "PAYSTACK",
      providerRef: init.reference,
    },
    update: {
      status: "PENDING",
      amount,
      provider: "PAYSTACK",
      providerRef: init.reference,
    },
  });

  return NextResponse.json({
    checkoutUrl: init.authorizationUrl,
    reference: init.reference,
  });
}
