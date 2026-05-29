import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    // 1. Appliquer les modes de paiement en attente
    const studentsWithPending = await prisma.student.findMany({
      where: { pendingPaymentMode: { not: null } },
      select: { id: true, pendingPaymentMode: true },
    });

    for (const student of studentsWithPending) {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          paymentMode: student.pendingPaymentMode!,
          pendingPaymentMode: null,
        },
      });
    }

    // 2. Appliquer les tarifs planifiés dont la date est dépassée
    const pendingPricing = await prisma.pricingConfig.findFirst({
      where: { appliedAt: null, effectiveFrom: { lte: new Date() } },
      orderBy: { effectiveFrom: "asc" },
    });

    if (pendingPricing) {
      await prisma.pricingConfig.update({
        where: { id: pendingPricing.id },
        data: { appliedAt: new Date() },
      });
    }

    // 3. Lire le tarif mensuel actif
    const activePricing = await prisma.pricingConfig.findFirst({
      where: { appliedAt: { not: null } },
      orderBy: { appliedAt: "desc" },
    });
    const monthlyCents = activePricing?.monthlyCents ?? 5000;

    // 4. Facturer les étudiants en mode mensuel
    const { count } = await prisma.student.updateMany({
      where: { paymentMode: "MONTHLY" },
      data: { balance: { increment: monthlyCents } },
    });

    console.log(`Cron billing: ${studentsWithPending.length} mode(s) appliqué(s), tarif ${pendingPricing ? "mis à jour" : "inchangé"}, ${count} étudiant(s) facturé(s)`);

    return NextResponse.json({
      success: true,
      modesApplied: studentsWithPending.length,
      pricingUpdated: !!pendingPricing,
      studentsBilled: count,
    });
  } catch (error) {
    console.error("Erreur cron billing", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
