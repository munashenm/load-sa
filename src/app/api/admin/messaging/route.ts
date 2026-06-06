import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { getMessagingConfig, isMessagingActive } from "@/lib/messaging";

export async function GET(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const config = getMessagingConfig();

  return NextResponse.json({
    active: isMessagingActive(),
    smsEnabled: config.smsEnabled,
    whatsappEnabled: config.whatsappEnabled,
    twilioConfigured: config.twilioConfigured,
    smsFromConfigured: Boolean(config.smsFrom),
    whatsappFromConfigured: Boolean(config.whatsappFrom),
    appUrl: config.appUrl,
  });
}
