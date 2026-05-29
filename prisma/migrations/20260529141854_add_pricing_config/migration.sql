-- CreateTable
CREATE TABLE "PricingConfig" (
    "id" TEXT NOT NULL,
    "perSessionCents" INTEGER NOT NULL,
    "monthlyCents" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);
