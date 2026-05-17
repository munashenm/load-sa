import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  const { id } = await params;

  if (!user?.driverProfile) {
    return NextResponse.json({ error: "Driver only" }, { status: 403 });
  }

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking || booking.driverId !== user.driverProfile.id) {
    return NextResponse.json({ error: "Not your job" }, { status: 403 });
  }

  const { notes, imageUrl } = await request.json();

  const proof = await db.deliveryProof.create({
    data: {
      bookingId: id,
      notes: notes ?? "Delivery completed",
      imageUrl: imageUrl ?? null,
    },
  });

  await db.booking.update({
    where: { id },
    data: { status: "DELIVERED" },
  });

  return NextResponse.json({ proof });
}
