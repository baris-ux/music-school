import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendInvitationEmail } from "@/lib/email";
import crypto from "crypto";
import DeleteStudentButton from "./DeleteStudentButton";

async function confirmPayment(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.student.update({
    where: { id },
    data: { balance: 0, paymentRequested: false },
  });

  revalidatePath("/admin/students");
}

async function renvoyerInvitation(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { student: true },
  });
  if (!user || !user.student) throw new Error("Étudiant introuvable");
  if (user.isActive) throw new Error("Ce compte est déjà actif");

  const invitationToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { invitationToken, tokenExpiresAt },
  });

  await sendInvitationEmail({
    to: user.email,
    firstName: user.student.firstName,
    token: invitationToken,
  });

  revalidatePath("/admin/students");
}

async function addEnrollment(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const studentId = String(formData.get("studentId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!studentId || !courseId) return;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { enrollments: true },
  });
  if (!course) return;
  if (course.enrollments.length >= course.capacity) return;

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (existing) return;

  await prisma.enrollment.create({ data: { studentId, courseId } });
  revalidatePath("/admin/students");
}

async function removeEnrollment(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.enrollment.delete({ where: { id } });
  revalidatePath("/admin/students");
}

export default async function StudentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/");

  const students = await prisma.student.findMany({
    include: {
      user: true,
      enrollments: { include: { course: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { lastName: "asc" },
  });

  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Étudiants</h1>
        <p className="mt-1 text-sm text-slate-700">
          Consultez, gérez les comptes et les inscriptions aux cours.
        </p>
      </div>

      {students.length === 0 ? (
        <p className="text-sm text-slate-700">Aucun étudiant pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {students.map((student) => {
            const enrolledCourseIds = student.enrollments.map((e) => e.courseId);
            const availableCourses = courses.filter(
              (c) => !enrolledCourseIds.includes(c.id)
            );

            return (
              <div
                key={student.id}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-4 shadow-sm space-y-4"
              >
                {/* Infos étudiant */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-950">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-slate-700">{student.user.email}</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        student.user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {student.user.isActive ? "Compte actif" : "En attente d'activation"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    Solde dû :{" "}
                    <span className={student.balance > 0 ? "text-red-600" : "text-green-600"}>
                      {(student.balance / 100).toFixed(2)} €
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    {student.paymentRequested && (
                      <form action={confirmPayment}>
                        <input type="hidden" name="id" value={student.id} />
                        <button
                          type="submit"
                          className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 hover:text-green-800"
                        >
                          Confirmer le paiement
                        </button>
                      </form>
                    )}
                    {!student.user.isActive && (
                      <form action={renvoyerInvitation}>
                        <input type="hidden" name="userId" value={student.user.id} />
                        <button
                          type="submit"
                          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Renvoyer le lien
                        </button>
                      </form>
                    )}
                    <DeleteStudentButton id={student.id} />
                  </div>
                </div>

                {/* Cours inscrits */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">Cours inscrits</p>
                  {student.enrollments.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucun cours assigné.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {student.enrollments.map((enrollment) => (
                        <form key={enrollment.id} action={removeEnrollment} className="inline-flex">
                          <input type="hidden" name="id" value={enrollment.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800 hover:bg-red-50 hover:text-red-700 transition"
                          >
                            {enrollment.course.title}
                            <span className="text-xs">✕</span>
                          </button>
                        </form>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ajouter un cours */}
                {availableCourses.length > 0 && (
                  <form action={addEnrollment} className="flex items-center gap-2">
                    <input type="hidden" name="studentId" value={student.id} />
                    <select
                      name="courseId"
                      required
                      defaultValue=""
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                    >
                      <option value="" disabled>Ajouter un cours...</option>
                      {availableCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
                    >
                      Ajouter
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}