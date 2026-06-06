import { NextResponse } from "next/server";
import { completeBookingPayment } from "@/lib/complete-booking-payment";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";

type PaystackWebhookEvent = {
  event: string;
  data?: {
    status?: string;
    reference?: string;
    amount?: number;
    metadata?: { booking_id?: string };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaystackWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.status === "success") {
    const bookingId = event.data.metadata?.booking_id;
    const reference = event.data.reference;
    const amount = (event.data.amount ?? 0) / 100;

    if (bookingId && reference) {
      await completeBookingPayment(bookingId, amount, reference);
    }
  }

  return NextResponse.json({ received: true });
}
