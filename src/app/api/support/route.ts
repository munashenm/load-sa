import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, message } = await request.json();
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
  }

  const ticket = await db.supportTicket.create({
    data: { userId: user.id, subject, message },
  });

  return NextResponse.json({ ticket });
}
