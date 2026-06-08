"use server";

import { sendInvitationEmail, sendRejectionEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function accepterInscription(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const demande = await prisma.inscriptionRequest.findUnique({
    where: { id },
    include: { courses: true },
  });
  if (!demande) throw new Error("Demande introuvable");

  const existingUser = await prisma.user.findUnique({
    where: { email: demande.email },
  });
  if (existingUser) throw new Error("Un compte existe déjà pour cet email");

  const invitationToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: demande.email,
        role: "STUDENT",
        isActive: false,
        invitationToken,
        tokenExpiresAt,
        student: {
          create: {
            firstName: demande.firstName,
            lastName: demande.lastName,
            phoneNumber: demande.phoneNumber,
          },
        },
      },
      include: { student: true },
    });

    if (user.student && demande.courses.length > 0) {
      await tx.enrollment.createMany({
        data: demande.courses.map((c) => ({
          studentId: user.student!.id,
          courseId: c.courseId,
        })),
      });
    }

    await tx.inscriptionRequest.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });
  });

  try {
    await sendInvitationEmail({
      to: demande.email,
      firstName: demande.firstName,
      token: invitationToken,
    });
  } catch (err) {
    console.error("Échec envoi email d'invitation — le compte existe, renvoyer depuis /admin/students", err);
  }

  revalidatePath("/admin/inscriptions");
}

export async function refuserInscription(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const demande = await prisma.inscriptionRequest.findUnique({ where: { id } });
  if (!demande) return;

  await prisma.inscriptionRequest.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  try {
    await sendRejectionEmail({ to: demande.email, firstName: demande.firstName });
  } catch (err) {
    console.error("Échec envoi email de refus", err);
  }

  revalidatePath("/admin/inscriptions");
}