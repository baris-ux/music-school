"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { put, del } from "@vercel/blob";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function uploadResource(
  prevState: { error: string | null; success: string | null },
  formData: FormData
): Promise<{ error: string | null; success: string | null }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const file = formData.get("file") as File;
  if (!title || !file || file.size === 0) {
    return { error: "Titre et fichier obligatoires", success: null };
  }
  if (file.type !== "application/pdf") {
    return { error: "Seuls les fichiers PDF sont acceptés", success: null };
  }
  const blob = await put(file.name, file, {
    access: "private",
    contentType: "application/pdf",
  });
  await prisma.resource.create({
    data: {
      title,
      description: description || null,
      fileUrl: blob.url,
      fileName: file.name,
    },
  });
  revalidatePath("/admin/ressources");
  return { error: null, success: "Ressource ajoutée avec succès" };
}

export async function deleteResource(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");
  const id = String(formData.get("id") ?? "");
  const fileUrl = String(formData.get("fileUrl") ?? "");
  if (!id) return;
  await del(fileUrl);
  await prisma.resource.delete({ where: { id } });
  revalidatePath("/admin/ressources");
}

export async function updateAccess(
  prevState: { error: string | null; success: string | null },
  formData: FormData
): Promise<{ error: string | null; success: string | null }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");
  const resourceId = String(formData.get("resourceId") ?? "");
  const studentIds = formData.getAll("studentIds") as string[];
  if (!resourceId) {
    return { error: "Ressource introuvable", success: null };
  }
  await prisma.resourceAccess.deleteMany({ where: { resourceId } });
  if (studentIds.length > 0) {
    await prisma.resourceAccess.createMany({
      data: studentIds.map((studentId) => ({ resourceId, studentId })),
    });
  }
  revalidatePath("/admin/ressources");
  return { error: null, success: "Accès mis à jour" };
}

export async function getResourceDownloadUrl(resourceId: string): Promise<string> {
  const session = await getSession();
  if (!session) redirect("/login");
  return `/api/resources/${resourceId}`;
}