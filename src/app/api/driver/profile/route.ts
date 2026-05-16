import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { driverProfileSchema, vehicleSchema } from "@/lib/validations";

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

  const { isAvailable } = await request.json();
  const profile = await db.driverProfile.update({
    where: { userId: user.id },
    data: { isAvailable: Boolean(isAvailable) },
  });

  return NextResponse.json({ profile });
}
