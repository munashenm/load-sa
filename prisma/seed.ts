import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo12345", 12);

  await db.platformSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", commissionPercent: 15 },
  });

  await db.user.upsert({
    where: { email: "admin@loadsa.co.za" },
    update: {},
    create: {
      email: "admin@loadsa.co.za",
      passwordHash,
      fullName: "Platform Admin",
      phone: "+27820000001",
      role: "ADMIN",
    },
  });

  await db.user.upsert({
    where: { email: "customer@demo.co.za" },
    update: {},
    create: {
      email: "customer@demo.co.za",
      passwordHash,
      fullName: "Demo Customer",
      phone: "+27821234567",
      role: "CUSTOMER",
    },
  });

  const driver = await db.user.upsert({
    where: { email: "driver@demo.co.za" },
    update: {},
    create: {
      email: "driver@demo.co.za",
      passwordHash,
      fullName: "Thabo Mokoena",
      phone: "+27829876543",
      role: "DRIVER",
      driverProfile: {
        create: {
          verificationStatus: "UNDER_REVIEW",
          idNumber: "8001015800084",
          licenseNumber: "DL12345678",
          province: "Gauteng",
          city: "Johannesburg",
          loadPreference: "EMPTY_RETURN_ONLY",
          bio: "Heavy truck JHB ↔ CT empty returns",
          vehicles: {
            create: {
              type: "HEAVY_TRUCK",
              make: "Volvo",
              model: "FH",
              registration: "GP 12 ABC GP",
              maxWeightKg: 34000,
            },
          },
        },
      },
    },
    include: { driverProfile: true },
  });

  console.log("Seed complete:");
  console.log("  admin@loadsa.co.za / demo12345");
  console.log("  customer@demo.co.za / demo12345");
  console.log("  driver@demo.co.za / demo12345 (under review)");
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect();
    process.exit(1);
  });
