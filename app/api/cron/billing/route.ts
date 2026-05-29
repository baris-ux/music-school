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

    // 2. Facturer les étudiants en mode mensuel (50 €)
    const { count } = await prisma.student.updateMany({
      where: { paymentMode: "MONTHLY" },
      data: { balance: { increment: 5000 } },
    });

    console.log(`Cron billing: ${studentsWithPending.length} mode(s) appliqué(s), ${count} étudiant(s) facturé(s)`);

    return NextResponse.json({
      success: true,
      modesApplied: studentsWithPending.length,
      studentsBilled: count,
    });
  } catch (error) {
    console.error("Erreur cron billing", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
