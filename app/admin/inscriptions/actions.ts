"use server";

import { sendInvitationEmail } from "@/lib/email";
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

  const demande = await prisma.inscriptionRequest.findUnique({ where: { id } });
  if (!demande) throw new Error("Demande introuvable");

  const existingUser = await prisma.user.findUnique({
    where: { email: demande.email },
  });
  if (existingUser) throw new Error("Un compte existe déjà pour cet email");

  const invitationToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.user.create({
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
    }),
    prisma.inscriptionRequest.update({
      where: { id },
      data: { status: "ACCEPTED" },
    }),
  ]);

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

  await prisma.inscriptionRequest.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  revalidatePath("/admin/inscriptions");
}