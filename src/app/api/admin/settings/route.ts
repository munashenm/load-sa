import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { commissionPercent } = await request.json();
  if (typeof commissionPercent !== "number" || commissionPercent < 0 || commissionPercent > 50) {
    return NextResponse.json({ error: "Invalid commission" }, { status: 400 });
  }

  const settings = await db.platformSettings.upsert({
    where: { id: "default" },
    update: { commissionPercent },
    create: { id: "default", commissionPercent },
  });

  return NextResponse.json({ settings });
}
