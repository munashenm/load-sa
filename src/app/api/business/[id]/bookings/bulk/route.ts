import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import {
  createBusinessBooking,
  getBusinessAccessForUser,
} from "@/lib/business-portal";
import { bulkBookingsSchema } from "@/lib/validations";

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
  const parsed = bulkBookingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < parsed.data.bookings.length; i++) {
    try {
      const result = await createBusinessBooking(user.id, id, parsed.data.bookings[i]);
      results.push(result.booking);
    } catch {
      errors.push({ index: i, error: "Failed to create booking" });
    }
  }

  return NextResponse.json({
    created: results.length,
    bookings: results,
    errors,
  });
}
