import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { db } from "@/lib/db";
import {
  DEFAULT_PRICING_CONFIG,
  parseVehicleRatesJson,
  type PricingConfig,
  type VehicleRate,
} from "@/lib/pricing-config";
import type { VehicleType } from "@/lib/types";
import { z } from "zod";

const vehicleRateSchema = z.object({ base: z.number().min(0), perKm: z.number().min(0) });

const putSchema = z.object({
  baseFee: z.number().min(0),
  pricePerKm: z.number().min(0),
  sameDaySurchargePct: z.number().min(0).max(200),
  expressSurchargePct: z.number().min(0).max(200),
  vehicleRates: z.record(z.string(), vehicleRateSchema),
});

export async function GET(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const row = await db.platformSettings.findUnique({ where: { id: "default" } });
  const config: PricingConfig = row
    ? {
        baseFee: row.baseFee,
        pricePerKm: row.pricePerKm,
        sameDaySurchargePct: row.sameDaySurchargePct,
        expressSurchargePct: row.expressSurchargePct,
        vehicleRates: parseVehicleRatesJson(row.vehicleRatesJson),
      }
    : DEFAULT_PRICING_CONFIG;

  return NextResponse.json({ config });
}

export async function PUT(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid pricing" }, { status: 400 });
  }

  const { baseFee, pricePerKm, sameDaySurchargePct, expressSurchargePct, vehicleRates } =
    parsed.data;

  const settings = await db.platformSettings.upsert({
    where: { id: "default" },
    update: {
      baseFee,
      pricePerKm,
      sameDaySurchargePct,
      expressSurchargePct,
      vehicleRatesJson: JSON.stringify(vehicleRates as Record<VehicleType, VehicleRate>),
    },
    create: {
      id: "default",
      commissionPercent: 15,
      baseFee,
      pricePerKm,
      sameDaySurchargePct,
      expressSurchargePct,
      vehicleRatesJson: JSON.stringify(vehicleRates),
    },
  });

  return NextResponse.json({
    config: {
      baseFee: settings.baseFee,
      pricePerKm: settings.pricePerKm,
      sameDaySurchargePct: settings.sameDaySurchargePct,
      expressSurchargePct: settings.expressSurchargePct,
      vehicleRates: parseVehicleRatesJson(settings.vehicleRatesJson),
    },
  });
}
