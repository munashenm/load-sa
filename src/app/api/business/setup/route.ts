import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import { businessSetupSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Customer account required" }, { status: 403 });
  }

  const existing = await db.businessAccount.findFirst({
    where: { ownerUserId: user.id },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You already have a business account", businessId: existing.id },
      { status: 409 },
    );
  }

  const body = await request.json();
  const parsed = businessSetupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const business = await db.businessAccount.create({
    data: {
      name: data.name,
      registrationNumber: data.registrationNumber,
      vatNumber: data.vatNumber,
      billingEmail: data.billingEmail,
      billingPhone: data.billingPhone,
      billingAddress: data.billingAddress,
      billingCity: data.billingCity,
      billingProvince: data.billingProvince,
      monthlyInvoicing: data.monthlyInvoicing,
      ownerUserId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      },
    },
  });

  return NextResponse.json({ business });
}
