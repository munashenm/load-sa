import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, fullName: true } },
      driver: { include: { user: { select: { fullName: true, phone: true } } } },
      proofs: { orderBy: { createdAt: "desc" }, take: 5 },
      payment: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isCustomer = booking.customerId === user.id;
  const isDriver = user.driverProfile?.id === booking.driverId;
  const isAdmin = user.role === "ADMIN";

  if (!isCustomer && !isDriver && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ booking });
}
