"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type AttendanceStatus = "PRESENT" | "ABSENT";
export type AttendanceRecord = {
  studentId: string;
  status: AttendanceStatus;
};

export async function getSessionWithAttendance(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      course: true,
      attendances: true,
    },
  });
  if (!session) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId: session.courseId,
      createdAt: {
        lte: session.startsAt, // ← seulement les étudiants inscrits avant la séance
      },
    },
    include: { student: true },
  });

  return { session, enrollments };
}

export async function saveAttendance(
  sessionId: string,
  records: AttendanceRecord[]
) {
  await Promise.all(
    records.map(async (record) => {
      const existing = await prisma.attendance.findUnique({
        where: { sessionId_studentId: { sessionId, studentId: record.studentId } },
      });

      const wasPresent = existing?.status === "PRESENT";
      const isNowPresent = record.status === "PRESENT";

      const student = await prisma.student.findUnique({
        where: { id: record.studentId },
        select: { balance: true, paymentMode: true },
      });

      // MONTHLY : pas de facturation à la séance
      if (student?.paymentMode === "MONTHLY") {
        await prisma.attendance.upsert({
          where: { sessionId_studentId: { sessionId, studentId: record.studentId } },
          update: { status: record.status, amountCents: 0 },
          create: { sessionId, studentId: record.studentId, status: record.status, amountCents: 0 },
        });
        return;
      }

      // PER_SESSION : calcule le montant à stocker
      let amountCents: number;
      if (isNowPresent && wasPresent) {
        // Statut inchangé : préserve le montant déjà enregistré
        amountCents = existing?.amountCents ?? 0;
      } else if (isNowPresent) {
        // Nouvelle présence : tarif actif au moment du marquage
        const pricing = await prisma.pricingConfig.findFirst({
          where: { appliedAt: { not: null } },
          orderBy: { appliedAt: "desc" },
        });
        amountCents = pricing?.perSessionCents ?? 1750;
      } else {
        amountCents = 0;
      }

      await prisma.attendance.upsert({
        where: { sessionId_studentId: { sessionId, studentId: record.studentId } },
        update: { status: record.status, amountCents },
        create: { sessionId, studentId: record.studentId, status: record.status, amountCents },
      });

      if (!wasPresent && isNowPresent) {
        await prisma.student.update({
          where: { id: record.studentId },
          data: { balance: { increment: amountCents } },
        });
      } else if (wasPresent && !isNowPresent) {
        // Utilise le montant original enregistré pour annuler exactement ce qui avait été facturé
        const charged = existing?.amountCents ?? 0;
        if (student && charged > 0 && student.balance >= charged) {
          await prisma.student.update({
            where: { id: record.studentId },
            data: { balance: { decrement: charged } },
          });
        }
      }
    })
  );

  revalidatePath(`/admin/sessions/${sessionId}/attendance`);
  revalidatePath(`/admin/sessions`);
  revalidatePath(`/admin/students`);
  return { success: true };
}