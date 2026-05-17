import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  driverBankSchema,
  driverDocumentsSchema,
  driverProfileSchema,
  driverVehicleExtendedSchema,
  vehicleSchema,
} from "@/lib/validations";

export async function GET() {
  const user = await getSessionUser();
  if (!user?.driverProfile) {
    return NextResponse.json({ error: "Not a driver" }, { status: 403 });
  }

  const profile = await db.driverProfile.findUnique({
    where: { userId: user.id },
    include: { vehicles: true, user: { select: { fullName: true, email: true, phone: true } } },
  });

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user?.driverProfile) {
    return NextResponse.json({ error: "Not a driver" }, { status: 403 });
  }

  const body = await request.json();
  const profileParsed = driverProfileSchema.safeParse(body.profile);
  if (!profileParsed.success) {
    return NextResponse.json(
      { error: profileParsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const profile = await db.driverProfile.update({
    where: { userId: user.id },
    data: {
      ...profileParsed.data,
      verificationStatus: "UNDER_REVIEW",
    },
  });

  if (body.vehicle) {
    const vehicleParsed = vehicleSchema.safeParse(body.vehicle);
    if (vehicleParsed.success) {
      const existing = await db.vehicle.findFirst({
        where: { driverProfileId: profile.id },
      });
      if (existing) {
        await db.vehicle.update({
          where: { id: existing.id },
          data: vehicleParsed.data,
        });
      } else {
        await db.vehicle.create({
          data: { ...vehicleParsed.data, driverProfileId: profile.id },
        });
      }
    }
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user?.driverProfile) {
    return NextResponse.json({ error: "Not a driver" }, { status: 403 });
  }

  const body = await request.json();
  const profile = await db.driverProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.isAvailable !== undefined) {
    if (profile.accountStatus === "SUSPENDED") {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }
    if (profile.verificationStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Complete verification before going online" },
        { status: 403 },
      );
    }
    const updated = await db.driverProfile.update({
      where: { userId: user.id },
      data: { isAvailable: Boolean(body.isAvailable) },
    });
    return NextResponse.json({ profile: updated });
  }

  if (body.bank) {
    const parsed = driverBankSchema.safeParse(body.bank);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid bank details" }, { status: 400 });
    }
    const updated = await db.driverProfile.update({
      where: { userId: user.id },
      data: parsed.data,
    });
    return NextResponse.json({ profile: updated });
  }

  if (body.documents) {
    const parsed = driverDocumentsSchema.safeParse(body.documents);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid documents" }, { status: 400 });
    }
    const data = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== undefined && v !== ""),
    );
    const updated = await db.driverProfile.update({
      where: { userId: user.id },
      data: {
        ...data,
        verificationStatus:
          profile.verificationStatus === "APPROVED"
            ? "APPROVED"
            : "UNDER_REVIEW",
      },
    });
    return NextResponse.json({ profile: updated });
  }

  if (body.vehicle) {
    const parsed = driverVehicleExtendedSchema.safeParse(body.vehicle);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid vehicle" }, { status: 400 });
    }
    const existing = await db.vehicle.findFirst({
      where: { driverProfileId: profile.id },
    });
    if (existing) {
      await db.vehicle.update({ where: { id: existing.id }, data: parsed.data });
    } else {
      await db.vehicle.create({
        data: { ...parsed.data, driverProfileId: profile.id },
      });
    }
    const refreshed = await db.driverProfile.findUnique({
      where: { userId: user.id },
      include: { vehicles: true },
    });
    return NextResponse.json({ profile: refreshed });
  }

  return NextResponse.json({ error: "No valid fields" }, { status: 400 });
}
