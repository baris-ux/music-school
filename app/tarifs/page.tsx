import { prisma } from "@/lib/prisma";
import TarifsContent from "./TarifsContent";

export default async function TarifsPage() {
  const [activePricing, pendingPricing] = await Promise.all([
    prisma.pricingConfig.findFirst({
      where: { appliedAt: { not: null } },
      orderBy: { appliedAt: "desc" },
    }),
    prisma.pricingConfig.findFirst({
      where: { appliedAt: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <TarifsContent
      activePerSession={activePricing?.perSessionCents ?? 1750}
      activeMonthly={activePricing?.monthlyCents ?? 5000}
      pendingPricing={
        pendingPricing
          ? {
              perSessionCents: pendingPricing.perSessionCents,
              monthlyCents: pendingPricing.monthlyCents,
              effectiveFrom: pendingPricing.effectiveFrom.toISOString(),
            }
          : null
      }
    />
  );
}
