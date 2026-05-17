import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bookings = await db.booking.findMany({
    where: {
      chatMessages: { some: {} },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      customer: { select: { fullName: true } },
      driver: { include: { user: { select: { fullName: true } } } },
      _count: { select: { chatMessages: true } },
      chatMessages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { fullName: true } } },
      },
    },
  });

  return NextResponse.json({ threads: bookings });
}
