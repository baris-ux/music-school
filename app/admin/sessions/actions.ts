"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type ActionState = {
  error?: string;
  success?: string;
};

export async function createSession(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();

  if (!session) {
    return { error: "Vous devez être connecté." };
  }

  if (session.role !== "ADMIN") {
    return { error: "Accès refusé." };
  }

  const courseId = String(formData.get("courseId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();

  if (!courseId || !date || !startTime || !endTime) {
    return { error: "Tous les champs sont obligatoires." };
  }

  const startsAt = new Date(`${date}T${startTime}:00`);
  const endsAt = new Date(`${date}T${endTime}:00`);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return { error: "Date ou heure invalide." };
  }

  if (endsAt <= startsAt) {
    return { error: "L'heure de fin doit être après l'heure de début." };
  }

  const hours = (endsAt.getTime() - startsAt.getTime()) / (1000 * 60 * 60);

  if (hours <= 0) {
    return { error: "La durée doit être positive." };
  }

  const existingCourse = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });

  if (!existingCourse) {
    return { error: "Cours introuvable." };
  }

  await prisma.session.create({
    data: {
      courseId,
      startsAt,
      endsAt,
      hours,
    },
  });

  revalidatePath("/admin/sessions");
  return { success: "La séance a bien été créée." };
}

export async function updateSessionStatus(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Accès refusé.");
  }

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as "PLANNED" | "CANCELLED" | "COMPLETED";

  if (!id || !["PLANNED", "CANCELLED", "COMPLETED"].includes(status)) {
    throw new Error("Données invalides.");
  }

  await prisma.session.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/sessions");
}

export async function deleteSession(formData: FormData) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    throw new Error("Accès refusé.");
  }

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Identifiant manquant.");
  }

  await prisma.session.delete({
    where: { id },
  });

  revalidatePath("/admin/sessions");
}