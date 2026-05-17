import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { ratingSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  const { id } = await params;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ratings = await db.bookingRating.findMany({
    where: { bookingId: id },
    include: { fromUser: { select: { fullName: true, role: true } } },
  });

  return NextResponse.json({ ratings });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  const { id } = await params;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking || booking.status !== "DELIVERED") {
    return NextResponse.json(
      { error: "Can only rate after delivery is complete" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const parsed = ratingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const { targetRole, scores, comment } = parsed.data;

  if (user.role === "CUSTOMER" && booking.customerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (user.role === "DRIVER") {
    if (!user.driverProfile || booking.driverId !== user.driverProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (user.role === "CUSTOMER" && targetRole !== "DRIVER") {
    return NextResponse.json({ error: "Customers rate drivers" }, { status: 400 });
  }
  if (user.role === "DRIVER" && targetRole !== "CUSTOMER") {
    return NextResponse.json({ error: "Drivers rate customers" }, { status: 400 });
  }

  const rating = await db.bookingRating.upsert({
    where: {
      bookingId_fromUserId_targetRole: {
        bookingId: id,
        fromUserId: user.id,
        targetRole,
      },
    },
    create: {
      bookingId: id,
      fromUserId: user.id,
      targetRole,
      scoresJson: JSON.stringify(scores),
      comment,
    },
    update: {
      scoresJson: JSON.stringify(scores),
      comment,
    },
  });

  if (targetRole === "DRIVER" && booking.driverId) {
    const values = Object.values(scores) as number[];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const profile = await db.driverProfile.findUnique({
      where: { id: booking.driverId },
    });
    if (profile) {
      const next = (profile.rating * 0.8 + avg * 0.2).toFixed(2);
      await db.driverProfile.update({
        where: { id: booking.driverId },
        data: { rating: parseFloat(next) },
      });
    }
  }

  return NextResponse.json({ rating });
}
