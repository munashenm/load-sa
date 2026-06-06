import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  action: z.enum(["suspend", "activate"]),
});

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
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const business = await db.businessAccount.update({
    where: { id },
    data: {
      status: parsed.data.action === "suspend" ? "SUSPENDED" : "ACTIVE",
    },
  });

  return NextResponse.json({ business });
}
