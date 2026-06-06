import { db } from "@/lib/db";
import { getMessagingConfig } from "@/lib/messaging/config";
import { sendSms, sendToAllChannels, sendWhatsApp } from "@/lib/messaging/twilio";

const BRAND = "FluxMove";

export async function sendUserMessage(
  userId: string,
  body: string,
): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  if (!user?.phone) return;
  await sendToAllChannels(user.phone, body);
}

export async function sendDeliveryOtpMessage(
  userId: string,
  reference: string,
  otp: string,
  bookingId: string,
): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  if (!user?.phone) return;

  const { appUrl } = getMessagingConfig();
  const trackUrl = `${appUrl}/track/${bookingId}`;

  const body =
    `${BRAND}: Your delivery OTP for ${reference} is ${otp}. ` +
    `Share this code with your driver only when you receive your goods. Track: ${trackUrl}`;

  await sendToAllChannels(user.phone, body);
}

export async function sendBookingConfirmation(
  userId: string,
  reference: string,
  bookingId: string,
): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  if (!user?.phone) return;

  const { appUrl } = getMessagingConfig();
  const body =
    `${BRAND}: Booking ${reference} confirmed. We're matching a verified driver. ` +
    `Track your delivery: ${appUrl}/track/${bookingId}`;

  await sendToAllChannels(user.phone, body);
}

export async function sendStatusMessage(
  phone: string,
  title: string,
  message: string,
  bookingId: string,
): Promise<void> {
  const { appUrl } = getMessagingConfig();
  const body = `${BRAND}: ${title} — ${message} Track: ${appUrl}/track/${bookingId}`;
  await sendToAllChannels(phone, body);
}

/** Notify driver of a new paid job (optional — SMS only to save WhatsApp template limits). */
export async function sendDriverJobAlert(
  driverUserId: string,
  reference: string,
): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: driverUserId },
    select: { phone: true },
  });
  if (!user?.phone) return;

  const { appUrl } = getMessagingConfig();
  const body =
    `${BRAND} Driver: New job ${reference} is available. ` +
    `Open the driver app: ${appUrl}/driver/jobs`;

  await sendSms(user.phone, body);
}

export { sendSms, sendWhatsApp, sendToAllChannels };
export { getMessagingConfig, isMessagingActive } from "@/lib/messaging/config";
