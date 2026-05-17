import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { applyOrderPricing } from "@/lib/platform";

/** MVP: simulates PayFast success — replace with real PayFast webhook later */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  const { id } = await params;

  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Customer only" }, { status: 403 });
  }

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking || booking.customerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const amount = booking.estimatedPrice;

  await db.payment.upsert({
    where: { bookingId: id },
    create: {
      bookingId: id,
      amount,
      status: "PAID",
      provider: "PAYFAST",
      providerRef: `PF-MVP-${Date.now()}`,
      paidAt: new Date(),
    },
    update: {
      status: "PAID",
      paidAt: new Date(),
    },
  });

  await db.booking.update({
    where: { id },
    data: { paymentStatus: "PAID" },
  });

  await applyOrderPricing(id, amount);

  const updated = await db.booking.findUnique({
    where: { id },
    include: { payment: true },
  });

  return NextResponse.json({ booking: updated });
}
