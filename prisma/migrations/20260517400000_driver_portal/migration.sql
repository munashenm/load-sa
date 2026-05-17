ALTER TABLE "DriverProfile" ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION DEFAULT 5;
ALTER TABLE "DriverProfile" ADD COLUMN IF NOT EXISTS "bankAccountHolder" TEXT;
ALTER TABLE "DriverProfile" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE "DriverProfile" ADD COLUMN IF NOT EXISTS "bankAccountNumber" TEXT;
ALTER TABLE "DriverProfile" ADD COLUMN IF NOT EXISTS "bankBranchCode" TEXT;
ALTER TABLE "DriverProfile" ADD COLUMN IF NOT EXISTS "idDocumentUrl" TEXT;
ALTER TABLE "DriverProfile" ADD COLUMN IF NOT EXISTS "licenseDocumentUrl" TEXT;
ALTER TABLE "DriverProfile" ADD COLUMN IF NOT EXISTS "proofOfAddressUrl" TEXT;
ALTER TABLE "DriverProfile" ADD COLUMN IF NOT EXISTS "vehicleRegistrationUrl" TEXT;
ALTER TABLE "DriverProfile" ADD COLUMN IF NOT EXISTS "vehiclePhotosJson" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "insuranceStatus" TEXT;

CREATE TABLE IF NOT EXISTS "BookingDecline" (
    "id" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingDecline_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BookingDecline_driverProfileId_bookingId_key" ON "BookingDecline"("driverProfileId", "bookingId");
ALTER TABLE "BookingDecline" ADD CONSTRAINT "BookingDecline_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
