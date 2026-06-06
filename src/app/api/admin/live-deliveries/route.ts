import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { getActiveDeliveriesForMap } from "@/lib/admin-live";

export async function GET(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deliveries = await getActiveDeliveriesForMap();
  return NextResponse.json({ deliveries, count: deliveries.length });
}
