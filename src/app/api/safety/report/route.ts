import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  bookingId: z.string().optional(),
  description: z.string().min(10),
});

export async function POST(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }

  const report = await db.safetyReport.create({
    data: {
      reporterId: user.id,
      bookingId: parsed.data.bookingId,
      description: parsed.data.description,
    },
  });

  return NextResponse.json({ report });
}
