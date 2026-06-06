import type { DeliveryUrgency } from "@/lib/types";

export type DeliveryTimeEstimate = {
  pickupTime: string;
  deliveryTime: string;
};

function formatDurationHours(hours: number): string {
  if (hours < 1) return "Within 45–90 minutes";
  if (hours < 4) return `Within ${Math.ceil(hours)} hours`;
  if (hours < 24) return `Within ${Math.ceil(hours)} hours`;
  const days = Math.ceil(hours / 24);
  return days === 1 ? "Within 1 business day" : `Within ${days} business days`;
}

function transitHours(distanceKm: number, stopCount: number): number {
  const avgSpeedKmh = 65;
  const base = distanceKm / avgSpeedKmh;
  const stopBuffer = stopCount * 0.75;
  return Math.max(1, base + stopBuffer);
}

export function estimateDeliveryTimes(input: {
  urgency: DeliveryUrgency;
  distanceKm: number;
  scheduledAt?: string | null;
  stopCount?: number;
}): DeliveryTimeEstimate {
  const stops = input.stopCount ?? 0;
  const transit = transitHours(input.distanceKm, stops);

  if (input.scheduledAt) {
    const scheduled = new Date(input.scheduledAt);
    const pickupLabel = scheduled.toLocaleString("en-ZA", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    const deliveryDate = new Date(scheduled.getTime() + transit * 60 * 60 * 1000);
    const deliveryLabel = deliveryDate.toLocaleString("en-ZA", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    return {
      pickupTime: `Scheduled: ${pickupLabel}`,
      deliveryTime: `Est. arrival: ${deliveryLabel}`,
    };
  }

  if (input.urgency === "EXPRESS") {
    return {
      pickupTime: "Within 45–90 minutes",
      deliveryTime: formatDurationHours(1.5 + transit),
    };
  }

  if (input.urgency === "SAME_DAY") {
    return {
      pickupTime: "Within 2–4 hours",
      deliveryTime: formatDurationHours(4 + transit),
    };
  }

  return {
    pickupTime: "Within 1–3 business days",
    deliveryTime: formatDurationHours(24 + transit * 2),
  };
}
