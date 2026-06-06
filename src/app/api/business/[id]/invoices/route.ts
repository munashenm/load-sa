import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import {
  canManageBusiness,
  generateMonthlyInvoice,
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

  const invoices = await db.businessInvoice.findMany({
    where: { businessAccountId: id },
    orderBy: { periodEnd: "desc" },
    take: 24,
  });

  return NextResponse.json({ invoices });
}

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
  if (!access || !canManageBusiness(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!access.business.monthlyInvoicing) {
    return NextResponse.json(
      { error: "Monthly invoicing is not enabled" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const periodStart = body.periodStart
    ? new Date(body.periodStart)
    : new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const periodEnd = body.periodEnd
    ? new Date(body.periodEnd)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59, 59);

  const invoice = await generateMonthlyInvoice(id, periodStart, periodEnd);
  if (!invoice) {
    return NextResponse.json(
      { error: "No invoiced bookings in this period" },
      { status: 404 },
    );
  }

  return NextResponse.json({ invoice });
}
