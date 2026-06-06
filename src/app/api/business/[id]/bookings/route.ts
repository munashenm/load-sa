import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import {
  canManageBusiness,
  createBusinessBooking,
  getBusinessAccessForUser,
} from "@/lib/business-portal";
import { db } from "@/lib/db";
import { bookingSchema, bulkBookingsSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  const { id } = await params;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getBusinessAccessForUser(user.id, id);
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  const bookings = await db.booking.findMany({
    where: {
      businessAccountId: id,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { fullName: true, email: true } },
      driver: { include: { user: { select: { fullName: true } } } },
    },
    take: 100,
  });

  return NextResponse.json({ bookings });
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

  const access = await getBusinessAccessForUser(user.id, id);
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const result = await createBusinessBooking(user.id, id, parsed.data);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Could not create booking" }, { status: 500 });
  }
}
