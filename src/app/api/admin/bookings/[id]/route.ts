import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { bookingStatusUpdateSchema } from "@/lib/validations";
import { z } from "zod";

const patchSchema = z.object({
  status: bookingStatusUpdateSchema.shape.status.optional(),
  driverId: z.string().nullable().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, fullName: true, email: true, phone: true } },
      driver: {
        include: {
          user: { select: { fullName: true, phone: true } },
          vehicles: { take: 1 },
        },
      },
      payment: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data: { status?: string; driverId?: string | null } = {};
  if (parsed.data.status) data.status = parsed.data.status;
  if (parsed.data.driverId !== undefined) {
    data.driverId = parsed.data.driverId;
    if (parsed.data.driverId && !parsed.data.status) {
      data.status = "DRIVER_ASSIGNED";
    }
  }

  const booking = await db.booking.update({
    where: { id },
    data,
  });

  return NextResponse.json({ booking });
}
