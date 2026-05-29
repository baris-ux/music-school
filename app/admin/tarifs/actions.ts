"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { resend } from "@/lib/email";

export async function createPricing(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const perSession = Math.round(Number(formData.get("perSession")) * 100);
  const monthly = Math.round(Number(formData.get("monthly")) * 100);
  const effectiveFrom = new Date(String(formData.get("effectiveFrom")));

  if (!perSession || !monthly || isNaN(effectiveFrom.getTime())) {
    throw new Error("Données invalides.");
  }

  const minDate = new Date();
  minDate.setMonth(minDate.getMonth() + 1);
  if (effectiveFrom < minDate) {
    throw new Error("La date d'entrée en vigueur doit être au minimum 1 mois à l'avance.");
  }

  // Annuler tout tarif en attente existant
  await prisma.pricingConfig.deleteMany({ where: { appliedAt: null } });

  await prisma.pricingConfig.create({
    data: { perSessionCents: perSession, monthlyCents: monthly, effectiveFrom },
  });

  // Notifier tous les étudiants actifs
  const students = await prisma.student.findMany({
    where: { user: { isActive: true } },
    include: { user: true },
  });

  if (resend && students.length > 0) {
    await Promise.allSettled(
      students.map((s) =>
        resend!.emails.send({
          from: "Académie de Musique <onboarding@resend.dev>",
          to: s.user.email,
          subject: "Modification des tarifs de l'académie",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
              <h2>Bonjour ${s.firstName},</h2>
              <p>Les tarifs de l'académie vont être modifiés à partir du
              <strong>${effectiveFrom.toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}</strong>.</p>
              <ul>
                <li><strong>Tarif à la séance :</strong> ${(perSession / 100).toFixed(2)} €</li>
                <li><strong>Tarif mensuel :</strong> ${(monthly / 100).toFixed(2)} €/mois</li>
              </ul>
              <p>Si vous avez des questions, n'hésitez pas à contacter l'académie.</p>
            </div>
          `,
        })
      )
    );
  }

  revalidatePath("/admin/tarifs");
}

export async function cancelPendingPricing() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  await prisma.pricingConfig.deleteMany({ where: { appliedAt: null } });
  revalidatePath("/admin/tarifs");
}
