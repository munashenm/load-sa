import { NextResponse } from "next/server";
import { z } from "zod";
import { canAccessChat, isChatUnlocked } from "@/lib/chat-access";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";

const postSchema = z.object({ body: z.string().min(1).max(2000) });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const unlocked = isChatUnlocked(booking.paymentStatus);
  const allowed = canAccessChat(booking, user);

  if (!allowed && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!unlocked && user.role !== "ADMIN") {
    return NextResponse.json({
      unlocked: false,
      messages: [],
      hint: "Chat will be available after payment is confirmed.",
    });
  }

  const messages = await db.chatMessage.findMany({
    where: { bookingId: id },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, fullName: true, role: true } },
    },
  });

  return NextResponse.json({ unlocked: true, messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canAccessChat(booking, user)) {
    if (!isChatUnlocked(booking.paymentStatus)) {
      return NextResponse.json(
        { error: "Chat will be available after payment is confirmed." },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const message = await db.chatMessage.create({
    data: {
      bookingId: id,
      senderId: user.id,
      body: parsed.data.body.trim(),
    },
    include: {
      sender: { select: { id: true, fullName: true, role: true } },
    },
  });

  return NextResponse.json({ message });
}
