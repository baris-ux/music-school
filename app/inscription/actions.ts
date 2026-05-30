"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function soumettreInscription(formData: FormData) {
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
    throw new Error("Champs obligatoires manquants");
  }

  if (!gdprConsent) {
    throw new Error("Le consentement RGPD est requis");
  }

  const existing = await prisma.inscriptionRequest.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error("Une demande existe déjà pour cet email");
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
      courses: courseIds.length > 0
        ? { create: courseIds.map((courseId) => ({ courseId })) }
        : undefined,
    },
  });

  redirect("/inscription/confirmation");
}