import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { getBusinessMembershipsForUser } from "@/lib/business-portal";

export async function GET(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businesses = await getBusinessMembershipsForUser(user.id);
  return NextResponse.json({ businesses });
}
