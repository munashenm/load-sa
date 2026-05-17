import { db } from "@/lib/db";

export async function getCommissionPercent(): Promise<number> {
  const settings = await db.platformSettings.findUnique({
    where: { id: "default" },
  });
  return settings?.commissionPercent ?? 15;
}

export function splitOrderAmount(total: number, commissionPercent: number) {
  const platformFee = Math.round((total * commissionPercent) / 100);
  const driverEarnings = Math.round(total - platformFee);
  return { platformFee, driverEarnings, commissionPercent };
}

export async function applyOrderPricing(bookingId: string, total: number) {
  const commissionPercent = await getCommissionPercent();
  const { platformFee, driverEarnings } = splitOrderAmount(total, commissionPercent);
  return db.booking.update({
    where: { id: bookingId },
    data: {
      finalPrice: total,
      commissionPercent,
      platformFee,
      driverEarnings,
    },
  });
}
