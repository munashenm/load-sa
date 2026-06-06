-- Business portal: members, invoices, booking linkage

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "businessAccountId" TEXT;

ALTER TABLE "BusinessAccount" ADD COLUMN IF NOT EXISTS "vatNumber" TEXT;
ALTER TABLE "BusinessAccount" ADD COLUMN IF NOT EXISTS "billingPhone" TEXT;
ALTER TABLE "BusinessAccount" ADD COLUMN IF NOT EXISTS "billingAddress" TEXT;
ALTER TABLE "BusinessAccount" ADD COLUMN IF NOT EXISTS "billingCity" TEXT;
ALTER TABLE "BusinessAccount" ADD COLUMN IF NOT EXISTS "billingProvince" TEXT;
ALTER TABLE "BusinessAccount" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE';

CREATE TABLE IF NOT EXISTS "BusinessMember" (
    "id" TEXT NOT NULL,
    "businessAccountId" TEXT NOT NULL,
    "userId" TEXT,
    "invitedEmail" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BusinessInvoice" (
    "id" TEXT NOT NULL,
    "businessAccountId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "lineItemsJson" TEXT,
    "issuedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessInvoice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BusinessMember_businessAccountId_userId_key" ON "BusinessMember"("businessAccountId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "BusinessMember_businessAccountId_invitedEmail_key" ON "BusinessMember"("businessAccountId", "invitedEmail");
CREATE UNIQUE INDEX IF NOT EXISTS "BusinessInvoice_reference_key" ON "BusinessInvoice"("reference");

ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_businessAccountId_fkey";
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "BusinessAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BusinessMember" DROP CONSTRAINT IF EXISTS "BusinessMember_businessAccountId_fkey";
ALTER TABLE "BusinessMember" ADD CONSTRAINT "BusinessMember_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "BusinessAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BusinessMember" DROP CONSTRAINT IF EXISTS "BusinessMember_userId_fkey";
ALTER TABLE "BusinessMember" ADD CONSTRAINT "BusinessMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BusinessInvoice" DROP CONSTRAINT IF EXISTS "BusinessInvoice_businessAccountId_fkey";
ALTER TABLE "BusinessInvoice" ADD CONSTRAINT "BusinessInvoice_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "BusinessAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill owner as member for existing business accounts
INSERT INTO "BusinessMember" ("id", "businessAccountId", "userId", "role", "status", "updatedAt")
SELECT
  'bm_' || "id",
  "id",
  "ownerUserId",
  'OWNER',
  'ACTIVE',
  CURRENT_TIMESTAMP
FROM "BusinessAccount" ba
WHERE NOT EXISTS (
  SELECT 1 FROM "BusinessMember" bm
  WHERE bm."businessAccountId" = ba."id" AND bm."userId" = ba."ownerUserId"
);
