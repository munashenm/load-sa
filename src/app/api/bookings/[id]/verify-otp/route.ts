import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { notifyCustomerForStatus } from "@/lib/notifications";
import { applyOrderPricing } from "@/lib/platform";
import { otpVerifySchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  const { id } = await params;

  if (!user?.driverProfile) {
    return NextResponse.json({ error: "Driver only" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking || booking.driverId !== user.driverProfile.id) {
    return NextResponse.json({ error: "Not your job" }, { status: 403 });
  }

  if (!booking.deliveryOtp) {
    return NextResponse.json(
      {
        error:
          "OTP not issued yet — customer must complete payment or use a business account with monthly invoicing",
      },
      { status: 400 },
    );
  }

  if (booking.deliveryOtp !== parsed.data.otp) {
    return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 });
  }

  const updated = await db.booking.update({
    where: { id },
    data: {
      deliveryOtpVerifiedAt: new Date(),
      status: "DELIVERED",
    },
  });

  await db.deliveryProof.create({
    data: {
      bookingId: id,
      type: "DELIVERY_PROOF",
      notes: "Delivery confirmed via OTP",
      otpVerified: true,
    },
  });

  await notifyCustomerForStatus(
    {
      id: booking.id,
      reference: booking.reference,
      customerId: booking.customerId,
      status: "DELIVERED",
    },
    booking.status,
  );

  if (booking.paymentStatus === "PAID" || booking.paymentStatus === "INVOICED") {
    await applyOrderPricing(id, booking.finalPrice ?? booking.estimatedPrice);
  }

  return NextResponse.json({ booking: updated, verified: true });
}
