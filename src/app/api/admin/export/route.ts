import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import {
  adminBookingsToCsv,
  adminDriversToCsv,
  getAdminBookingsForExport,
  getAdminDriversForExport,
} from "@/lib/admin-reports";

export async function GET(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "bookings";

  if (type === "drivers") {
    const drivers = await getAdminDriversForExport();
    const csv = adminDriversToCsv(drivers);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="fluxmove-drivers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const bookings = await getAdminBookingsForExport();
  const csv = adminBookingsToCsv(bookings);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fluxmove-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
