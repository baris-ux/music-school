"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
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
      // Récupère l'ancienne présence si elle existe
      const existing = await prisma.attendance.findUnique({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: record.studentId,
          },
        },
      });

      const wasPresent = existing?.status === "PRESENT";
      const isNowPresent = record.status === "PRESENT";

      await prisma.attendance.upsert({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: record.studentId,
          },
        },
        update: { status: record.status },
        create: {
          sessionId,
          studentId: record.studentId,
          status: record.status,
        },
      });

      const student = await prisma.student.findUnique({
        where: { id: record.studentId },
        select: { balance: true, paymentMode: true },
      });

      // Le mode MONTHLY ne génère pas de facturation à la séance
      if (student?.paymentMode === "MONTHLY") return;

      const PRICE = 1750; // 17,50 €

      if (!wasPresent && isNowPresent) {
        await prisma.student.update({
          where: { id: record.studentId },
          data: { balance: { increment: PRICE } },
        });
      } else if (wasPresent && !isNowPresent) {
        if (student && student.balance >= PRICE) {
          await prisma.student.update({
            where: { id: record.studentId },
            data: { balance: { decrement: PRICE } },
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