import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import {
  bookingsToCsv,
  getBusinessAccessForUser,
} from "@/lib/business-portal";
import { db } from "@/lib/db";

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
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const bookings = await db.booking.findMany({
    where: {
      businessAccountId: id,
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { fullName: true, email: true } },
    },
  });

  const csv = bookingsToCsv(bookings);
  const filename = `fluxmove-${access.business.name.replace(/\s+/g, "-").toLowerCase()}-deliveries.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
