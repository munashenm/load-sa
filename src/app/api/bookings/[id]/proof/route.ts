import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  const { id } = await params;

  if (!user?.driverProfile) {
    return NextResponse.json({ error: "Driver only" }, { status: 403 });
  }

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking || booking.driverId !== user.driverProfile.id) {
    return NextResponse.json({ error: "Not your job" }, { status: 403 });
  }

  const { notes, imageUrl, proofType, signatureUrl } = await request.json();
  const type =
    proofType === "PICKUP" ? "PICKUP_PROOF" : proofType === "DELIVERY" ? "DELIVERY_PROOF" : "PHOTO";

  const proof = await db.deliveryProof.create({
    data: {
      bookingId: id,
      notes: notes ?? (type === "PICKUP_PROOF" ? "Pickup proof" : "Delivery proof"),
      imageUrl: imageUrl ?? null,
      signatureUrl: signatureUrl ?? null,
      type,
    },
  });

  if (type === "DELIVERY_PROOF" || proofType === "DELIVERY") {
    await db.booking.update({
      where: { id },
      data: { status: "DELIVERED" },
    });
  }

  return NextResponse.json({ proof });
}
