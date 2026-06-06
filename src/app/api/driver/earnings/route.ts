import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { getDriverEarningsStats, getDriverProfileForUser } from "@/lib/driver-portal";

export async function GET(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== "DRIVER") {
    return NextResponse.json({ error: "Driver only" }, { status: 403 });
  }

  const profile = await getDriverProfileForUser(user.id);
  if (!profile) {
    return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
  }

  const stats = await getDriverEarningsStats(profile.id);
  return NextResponse.json({
    walletBalance: profile.walletBalance,
    ...stats,
  });
}
