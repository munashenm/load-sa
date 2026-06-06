import { normalizePhone } from "@/lib/sa-data";
import type { MessagingChannel, SendResult } from "@/lib/messaging/config";
import { getMessagingConfig } from "@/lib/messaging/config";

async function twilioSend(
  to: string,
  from: string,
  body: string,
  channel: MessagingChannel,
): Promise<SendResult> {
  const config = getMessagingConfig();
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

  if (!config.twilioConfigured || !accountSid || !authToken) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[messaging:${channel}] (dev) To ${to}: ${body}`);
    }
    return { ok: true, channel, skipped: true };
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      },
    );

    const data = (await res.json()) as { sid?: string; message?: string };

    if (!res.ok) {
      console.error(`[messaging:${channel}] Twilio error:`, data.message ?? res.status);
      return {
        ok: false,
        channel,
        error: data.message ?? `HTTP ${res.status}`,
      };
    }

    return { ok: true, channel, messageId: data.sid };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    console.error(`[messaging:${channel}]`, message);
    return { ok: false, channel, error: message };
  }
}

function toE164(phone: string): string | null {
  const normalized = normalizePhone(phone);
  if (!normalized.startsWith("+")) return null;
  return normalized;
}

export async function sendSms(phone: string, body: string): Promise<SendResult> {
  const config = getMessagingConfig();
  if (!config.smsEnabled || !config.smsFrom) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[messaging:sms] (disabled) ${body}`);
    }
    return { ok: true, channel: "sms", skipped: true };
  }

  const e164 = toE164(phone);
  if (!e164) {
    return { ok: false, channel: "sms", error: "Invalid phone number" };
  }

  return twilioSend(e164, config.smsFrom, body, "sms");
}

export async function sendWhatsApp(phone: string, body: string): Promise<SendResult> {
  const config = getMessagingConfig();
  if (!config.whatsappEnabled || !config.whatsappFrom) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[messaging:whatsapp] (disabled) ${body}`);
    }
    return { ok: true, channel: "whatsapp", skipped: true };
  }

  const e164 = toE164(phone);
  if (!e164) {
    return { ok: false, channel: "whatsapp", error: "Invalid phone number" };
  }

  const to = e164.startsWith("whatsapp:") ? e164 : `whatsapp:${e164}`;
  const from = config.whatsappFrom.startsWith("whatsapp:")
    ? config.whatsappFrom
    : `whatsapp:${config.whatsappFrom}`;

  return twilioSend(to, from, body, "whatsapp");
}

export async function sendToAllChannels(
  phone: string,
  body: string,
): Promise<SendResult[]> {
  const [sms, whatsapp] = await Promise.all([
    sendSms(phone, body),
    sendWhatsApp(phone, body),
  ]);
  return [sms, whatsapp];
}
