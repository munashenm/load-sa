export type MessagingChannel = "sms" | "whatsapp";

export type SendResult = {
  ok: boolean;
  channel: MessagingChannel;
  skipped?: boolean;
  messageId?: string;
  error?: string;
};

export type MessagingConfig = {
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  twilioConfigured: boolean;
  smsFrom: string | null;
  whatsappFrom: string | null;
  appUrl: string;
};

export function getMessagingConfig(): MessagingConfig {
  const smsFrom = process.env.TWILIO_SMS_FROM?.trim() || null;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM?.trim() || null;
  const twilioConfigured = Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim(),
  );

  return {
    smsEnabled: process.env.SMS_ENABLED === "true",
    whatsappEnabled: process.env.WHATSAPP_ENABLED === "true",
    twilioConfigured,
    smsFrom,
    whatsappFrom,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://fluxmove.co.za",
  };
}

export function isMessagingActive(): boolean {
  const c = getMessagingConfig();
  return (
    c.twilioConfigured &&
    ((c.smsEnabled && Boolean(c.smsFrom)) ||
      (c.whatsappEnabled && Boolean(c.whatsappFrom)))
  );
}
