-- Smart pricing surcharges
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "fragileSurchargePct" DOUBLE PRECISION DEFAULT 12;
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "tollSurchargePct" DOUBLE PRECISION DEFAULT 8;
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "nightSurchargePct" DOUBLE PRECISION DEFAULT 15;
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "insuredSurchargePct" DOUBLE PRECISION DEFAULT 18;
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "multiStopSurchargePct" DOUBLE PRECISION DEFAULT 20;

-- Booking pricing & delivery options
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "deliveryCategory" TEXT DEFAULT 'GENERAL';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "isFragile" BOOLEAN DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "usesTollRoads" BOOLEAN DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "isNightDelivery" BOOLEAN DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "insuranceLevel" TEXT DEFAULT 'STANDARD';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "stopsJson" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "priceBreakdownJson" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "deliveryOtp" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "deliveryOtpVerifiedAt" TIMESTAMP(3);

-- POD
ALTER TABLE "DeliveryProof" ADD COLUMN IF NOT EXISTS "signatureUrl" TEXT;
ALTER TABLE "DeliveryProof" ADD COLUMN IF NOT EXISTS "otpVerified" BOOLEAN DEFAULT false;

-- Driver wallet
ALTER TABLE "DriverProfile" ADD COLUMN IF NOT EXISTS "walletBalance" DOUBLE PRECISION DEFAULT 0;

-- User trust & referrals
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifiedBadge" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredByCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fraudFlagsJson" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode") WHERE "referralCode" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "BookingRating" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "scoresJson" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingRating_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BookingRating_bookingId_fromUserId_targetRole_key" ON "BookingRating"("bookingId", "fromUserId", "targetRole");

ALTER TABLE "BookingRating" ADD CONSTRAINT "BookingRating_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingRating" ADD CONSTRAINT "BookingRating_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "SafetyReport" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "reporterId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SafetyReport_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "BusinessAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "billingEmail" TEXT NOT NULL,
    "monthlyInvoicing" BOOLEAN NOT NULL DEFAULT false,
    "ownerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BusinessAccount_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "BusinessAccount" ADD CONSTRAINT "BusinessAccount_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "WalletWithdrawal" (
    "id" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletWithdrawal_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "WalletWithdrawal" ADD CONSTRAINT "WalletWithdrawal_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
