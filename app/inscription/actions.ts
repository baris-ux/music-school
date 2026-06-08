"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { sendInscriptionConfirmationEmail } from "@/lib/email";

export type InscriptionState = { error?: string };

export async function soumettreInscription(
  _prevState: InscriptionState,
  formData: FormData
): Promise<InscriptionState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const isParent = formData.get("isParent") === "on";
  const parentFirstName = String(formData.get("parentFirstName") ?? "").trim();
  const parentLastName = String(formData.get("parentLastName") ?? "").trim();
  const courseIds = formData.getAll("courseIds").map(String).filter(Boolean);
  const gdprConsent = formData.get("gdprConsent") === "on";

  if (!firstName || !lastName || !email) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  if (isParent && (!parentFirstName || !parentLastName)) {
    return { error: "Veuillez renseigner le prénom et le nom du parent." };
  }

  if (courseIds.length === 0) {
    return { error: "Veuillez sélectionner au moins un cours." };
  }

  if (!gdprConsent) {
    return { error: "Vous devez accepter le traitement de vos données pour continuer." };
  }

  const existing = await prisma.inscriptionRequest.findUnique({
    where: { email },
  });

  if (existing) {
    return { error: "Une demande d'inscription existe déjà pour cette adresse e-mail." };
  }

  await prisma.inscriptionRequest.create({
    data: {
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber || null,
      message: message || null,
      isParent,
      parentFirstName: isParent ? parentFirstName || null : null,
      parentLastName: isParent ? parentLastName || null : null,
      courses: { create: courseIds.map((courseId) => ({ courseId })) },
    },
  });

  try {
    await sendInscriptionConfirmationEmail({ to: email, firstName });
  } catch (err) {
    console.error("Échec envoi email de confirmation d'inscription", err);
  }

  redirect("/inscription/confirmation");
}