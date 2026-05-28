"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function deleteStudent(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!student) throw new Error("Étudiant introuvable");

  await prisma.$transaction([
    prisma.resourceAccess.deleteMany({ where: { studentId: id } }),
    prisma.attendance.deleteMany({ where: { studentId: id } }),
    prisma.enrollment.deleteMany({ where: { studentId: id } }),
    prisma.student.delete({ where: { id } }),
    prisma.inscriptionRequest.deleteMany({ where: { email: student.user.email } }),
    prisma.user.delete({ where: { id: student.user.id } }),
  ]);

  revalidatePath("/admin/students");
}
