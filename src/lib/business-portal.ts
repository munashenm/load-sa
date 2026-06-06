import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { db } from "@/lib/db";

export type BusinessMemberRole = "OWNER" | "ADMIN" | "MEMBER";

export type BusinessAccess = {
  business: {
    id: string;
    name: string;
    billingEmail: string;
    monthlyInvoicing: boolean;
    status: string;
    registrationNumber: string | null;
    vatNumber: string | null;
    billingPhone: string | null;
    billingAddress: string | null;
    billingCity: string | null;
    billingProvince: string | null;
  };
  role: BusinessMemberRole;
};

export async function getBusinessMembershipsForUser(
  userId: string,
): Promise<BusinessAccess[]> {
  const memberships = await db.businessMember.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      businessAccount: true,
    },
  });

  return memberships.map((m) => ({
    business: {
      id: m.businessAccount.id,
      name: m.businessAccount.name,
      billingEmail: m.businessAccount.billingEmail,
      monthlyInvoicing: m.businessAccount.monthlyInvoicing,
      status: m.businessAccount.status,
      registrationNumber: m.businessAccount.registrationNumber,
      vatNumber: m.businessAccount.vatNumber,
      billingPhone: m.businessAccount.billingPhone,
      billingAddress: m.businessAccount.billingAddress,
      billingCity: m.businessAccount.billingCity,
      billingProvince: m.businessAccount.billingProvince,
    },
    role: m.role as BusinessMemberRole,
  }));
}

export async function getBusinessAccessForUser(
  userId: string,
  businessId: string,
): Promise<BusinessAccess | null> {
  const membership = await db.businessMember.findFirst({
    where: {
      businessAccountId: businessId,
      userId,
      status: "ACTIVE",
    },
    include: { businessAccount: true },
  });

  if (!membership || membership.businessAccount.status !== "ACTIVE") {
    return null;
  }

  return {
    business: {
      id: membership.businessAccount.id,
      name: membership.businessAccount.name,
      billingEmail: membership.businessAccount.billingEmail,
      monthlyInvoicing: membership.businessAccount.monthlyInvoicing,
      status: membership.businessAccount.status,
      registrationNumber: membership.businessAccount.registrationNumber,
      vatNumber: membership.businessAccount.vatNumber,
      billingPhone: membership.businessAccount.billingPhone,
      billingAddress: membership.businessAccount.billingAddress,
      billingCity: membership.businessAccount.billingCity,
      billingProvince: membership.businessAccount.billingProvince,
    },
    role: membership.role as BusinessMemberRole,
  };
}

export function canManageBusiness(role: BusinessMemberRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export async function requireBusinessAccess(
  user: User,
  businessId: string,
  manage = false,
): Promise<BusinessAccess> {
  const access = await getBusinessAccessForUser(user.id, businessId);
  if (!access) {
    redirect("/business/setup");
  }
  if (manage && !canManageBusiness(access.role)) {
    redirect(`/business/${businessId}`);
  }
  return access;
}

export async function activatePendingBusinessInvites(
  userId: string,
  email: string,
): Promise<void> {
  await db.businessMember.updateMany({
    where: {
      invitedEmail: email.toLowerCase(),
      status: "INVITED",
    },
    data: {
      userId,
      status: "ACTIVE",
    },
  });
}

export async function getPrimaryBusinessForUser(
  userId: string,
): Promise<BusinessAccess | null> {
  const list = await getBusinessMembershipsForUser(userId);
  return list[0] ?? null;
}

export function generateInvoiceReference(): string {
  const part = Date.now().toString(36).toUpperCase().slice(-5);
  return `INV-${part}`;
}

export async function getBusinessDashboardStats(businessId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [total, thisMonth, today, scheduled, pendingInvoice, active] =
    await Promise.all([
      db.booking.count({ where: { businessAccountId: businessId } }),
      db.booking.count({
        where: {
          businessAccountId: businessId,
          createdAt: { gte: startOfMonth },
        },
      }),
      db.booking.count({
        where: {
          businessAccountId: businessId,
          createdAt: { gte: startOfDay },
        },
      }),
      db.booking.count({
        where: {
          businessAccountId: businessId,
          scheduledAt: { gte: now },
          status: { notIn: ["DELIVERED", "CANCELLED"] },
        },
      }),
      db.booking.count({
        where: {
          businessAccountId: businessId,
          paymentStatus: "INVOICED",
        },
      }),
      db.booking.count({
        where: {
          businessAccountId: businessId,
          status: { notIn: ["DELIVERED", "CANCELLED"] },
        },
      }),
    ]);

  const spendAgg = await db.booking.aggregate({
    where: {
      businessAccountId: businessId,
      createdAt: { gte: startOfMonth },
      status: { not: "CANCELLED" },
    },
    _sum: { estimatedPrice: true },
  });

  return {
    totalBookings: total,
    bookingsThisMonth: thisMonth,
    bookingsToday: today,
    scheduledDeliveries: scheduled,
    pendingInvoiceBookings: pendingInvoice,
    activeDeliveries: active,
    spendThisMonth: spendAgg._sum.estimatedPrice ?? 0,
  };
}

export function bookingsToCsv(
  bookings: {
    reference: string;
    status: string;
    paymentStatus: string;
    pickupAddress: string;
    pickupCity: string;
    dropoffAddress: string;
    dropoffCity: string;
    vehicleType: string;
    estimatedPrice: number;
    scheduledAt: Date | null;
    createdAt: Date;
    customer?: { fullName: string; email: string } | null;
  }[],
): string {
  const header =
    "Reference,Status,Payment,Pickup,Dropoff,Vehicle,Price ZAR,Scheduled,Created,Booked By";
  const rows = bookings.map((b) => {
    const cols = [
      b.reference,
      b.status,
      b.paymentStatus,
      `"${b.pickupCity} - ${b.pickupAddress.replace(/"/g, '""')}"`,
      `"${b.dropoffCity} - ${b.dropoffAddress.replace(/"/g, '""')}"`,
      b.vehicleType,
      String(b.estimatedPrice),
      b.scheduledAt?.toISOString() ?? "",
      b.createdAt.toISOString(),
      b.customer ? `"${b.customer.fullName}"` : "",
    ];
    return cols.join(",");
  });
  return [header, ...rows].join("\n");
}

import type { z } from "zod";
import type { bookingSchema } from "@/lib/validations";

type BookingInput = z.infer<typeof bookingSchema>;

export async function createBusinessBooking(
  userId: string,
  businessId: string,
  parsed: BookingInput,
) {
  const { estimateBookingPriceFromDb, generateBookingReference } = await import(
    "@/lib/pricing"
  );

  const access = await getBusinessAccessForUser(userId, businessId);
  if (!access) {
    throw new Error("Business access denied");
  }

  const { total, breakdown } = await estimateBookingPriceFromDb({
    vehicleType: parsed.vehicleType,
    pickupProvince: parsed.pickupProvince,
    dropoffProvince: parsed.dropoffProvince,
    weightKg: parsed.weightKg,
    urgency: parsed.urgency,
    cargoSize: parsed.cargoSize,
    deliveryCategory: parsed.deliveryCategory,
    isFragile: parsed.isFragile ?? parsed.deliveryCategory === "FRAGILE",
    usesTollRoads: parsed.usesTollRoads,
    isNightDelivery: parsed.isNightDelivery,
    insuranceLevel: parsed.insuranceLevel,
    stops: parsed.stops,
    scheduledAt: parsed.scheduledAt,
  });

  const paymentStatus = access.business.monthlyInvoicing ? "INVOICED" : "UNPAID";
  const { generateDeliveryOtp } = await import("@/lib/smart-pricing");
  const deliveryOtp = access.business.monthlyInvoicing
    ? generateDeliveryOtp()
    : undefined;

  const booking = await db.booking.create({
    data: {
      reference: generateBookingReference(),
      customerId: userId,
      businessAccountId: businessId,
      pickupAddress: parsed.pickupAddress,
      pickupCity: parsed.pickupCity,
      pickupProvince: parsed.pickupProvince,
      pickupLat: parsed.pickupLat,
      pickupLng: parsed.pickupLng,
      dropoffAddress: parsed.dropoffAddress,
      dropoffCity: parsed.dropoffCity,
      dropoffProvince: parsed.dropoffProvince,
      dropoffLat: parsed.dropoffLat,
      dropoffLng: parsed.dropoffLng,
      vehicleType: parsed.vehicleType,
      cargoDescription: parsed.cargoDescription,
      cargoSize: parsed.cargoSize,
      cargoDimensions: parsed.cargoDimensions || undefined,
      cargoImageUrl: parsed.cargoImageUrl || undefined,
      weightKg: parsed.weightKg,
      urgency: parsed.urgency,
      deliveryCategory: parsed.deliveryCategory,
      isFragile: parsed.isFragile ?? parsed.deliveryCategory === "FRAGILE",
      usesTollRoads: parsed.usesTollRoads ?? false,
      isNightDelivery: parsed.isNightDelivery ?? false,
      insuranceLevel: parsed.insuranceLevel,
      stopsJson: parsed.stops?.length ? JSON.stringify(parsed.stops) : undefined,
      priceBreakdownJson: JSON.stringify(breakdown),
      estimatedPrice: total,
      scheduledAt: parsed.scheduledAt ? new Date(parsed.scheduledAt) : undefined,
      paymentStatus,
      deliveryOtp,
    },
  });

  const { sendBookingConfirmation, sendDeliveryOtpMessage } = await import(
    "@/lib/messaging"
  );
  await sendBookingConfirmation(userId, booking.reference, booking.id);
  if (deliveryOtp) {
    await sendDeliveryOtpMessage(userId, booking.reference, deliveryOtp, booking.id);
  }

  return { booking, breakdown, paymentStatus };
}

export async function generateMonthlyInvoice(
  businessId: string,
  periodStart: Date,
  periodEnd: Date,
) {
  const bookings = await db.booking.findMany({
    where: {
      businessAccountId: businessId,
      paymentStatus: "INVOICED",
      status: { not: "CANCELLED" },
      createdAt: { gte: periodStart, lte: periodEnd },
    },
    orderBy: { createdAt: "asc" },
  });

  if (bookings.length === 0) {
    return null;
  }

  const lineItems = bookings.map((b) => ({
    bookingId: b.id,
    reference: b.reference,
    description: `${b.pickupCity} → ${b.dropoffCity}`,
    amount: b.finalPrice ?? b.estimatedPrice,
    date: b.createdAt.toISOString(),
  }));

  const totalAmount = lineItems.reduce((s, l) => s + l.amount, 0);
  const dueAt = new Date(periodEnd);
  dueAt.setDate(dueAt.getDate() + 30);

  const invoice = await db.businessInvoice.create({
    data: {
      reference: generateInvoiceReference(),
      businessAccountId: businessId,
      periodStart,
      periodEnd,
      totalAmount,
      status: "ISSUED",
      lineItemsJson: JSON.stringify(lineItems),
      issuedAt: new Date(),
      dueAt,
    },
  });

  await db.booking.updateMany({
    where: { id: { in: bookings.map((b) => b.id) } },
    data: { paymentStatus: "PENDING" },
  });

  return invoice;
}
