import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";

const schema = z.object({
  bookingId: z.string().min(1),
  subject: z.string().min(3).max(120),
  description: z.string().min(10).max(3000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

export async function POST(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user || (user.role !== "CUSTOMER" && user.role !== "DRIVER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid complaint" }, { status: 400 });
  }

  const booking = await db.booking.findUnique({
    where: { id: parsed.data.bookingId },
  });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isCustomer = user.role === "CUSTOMER" && booking.customerId === user.id;
  const isDriver =
    user.role === "DRIVER" &&
    user.driverProfile &&
    booking.driverId === user.driverProfile.id;

  if (!isCustomer && !isDriver) {
    return NextResponse.json({ error: "Not your booking" }, { status: 403 });
  }

  const complaint = await db.complaint.create({
    data: {
      bookingId: booking.id,
      raisedById: user.id,
      complainantType: user.role,
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority: parsed.data.priority,
    },
  });

  return NextResponse.json({ complaint });
}
