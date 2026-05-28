import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getSignedResourceUrl } from "@/app/admin/ressources/actions";
import SessionCalendar from "./SessionCalendar";

import { revalidatePath } from "next/cache";

export default async function StudentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "STUDENT") redirect("/");

  const student = await prisma.student.findUnique({
    where: { userId: session.userId },
    include: {
      user: true,
      enrollments: {
        include: { course: true },
        orderBy: { createdAt: "desc" },
      },
      accesses: {
        include: { resource: true },
        orderBy: { createdAt: "desc" },
      },
      attendances: {
        where: { status: "PRESENT" },
        include: {
          session: {
            include: { course: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  async function requestPayment(formData: FormData) {
    "use server";
    const session = await getSession();
    if (!session) redirect("/login");

    await prisma.student.update({
      where: { userId: session.userId },
      data: { paymentRequested: true },
    });

    revalidatePath("/student");
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-950">Portail étudiant</h1>
        <p className="text-sm text-slate-700">Aucun profil étudiant associé à ce compte.</p>
      </div>
    );
  }

  const resourcesWithUrls = await Promise.all(
    student.accesses.map(async (access) => ({
      ...access.resource,
      downloadUrl: await getSignedResourceUrl(access.resource.fileUrl),
    }))
  );

  const upcomingSessions = await prisma.session.findMany({
    where: {
      courseId: { in: student.enrollments.map((e) => e.courseId) },
      startsAt: { gte: new Date() },
      status: "PLANNED",
    },
    include: { course: true },
    orderBy: { startsAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Portail étudiant</h1>
        <p className="mt-1 text-sm text-slate-700">
          Bienvenue {student.firstName} {student.lastName}.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Mes prochaines séances</h2>
        <div className="mt-4">
          <SessionCalendar
            sessions={upcomingSessions.map((s) => ({
              id: s.id,
              startsAt: s.startsAt.toISOString(),
              endsAt: s.endsAt.toISOString(),
              course: { title: s.course.title },
            }))}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Mes informations</h2>
        <div className="mt-3 space-y-1 text-sm text-slate-700">
          <p><span className="font-medium text-slate-900">Nom :</span> {student.firstName} {student.lastName}</p>
          <p><span className="font-medium text-slate-900">Email :</span> {student.user.email}</p>
          <p>
            <span className="font-medium text-slate-900">Solde dû :</span>{" "}
            <span className={student.balance > 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
              {(student.balance / 100).toFixed(2)} €
            </span>
          </p>
        </div>
      </div>

      {/* Détail des séances facturées */}
      <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Détail des séances</h2>
        {student.attendances.length === 0 ? (
          <p className="mt-3 text-sm text-slate-700">Aucune séance facturée pour le moment.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {student.attendances.map((attendance) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {attendance.session.course.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(attendance.session.startsAt).toLocaleDateString("fr-BE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-800">10,00 €</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-2">
              <span className="text-sm font-semibold text-slate-900">Total dû</span>
              <span className={`text-sm font-bold ${student.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                {(student.balance / 100).toFixed(2)} €
              </span>
            </div>

            {/* Informations de virement si solde dû */}
            {student.balance > 0 && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 space-y-1">
                <p className="text-sm font-semibold text-blue-900">Informations de virement</p>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Bénéficiaire :</span> {process.env.SCHOOL_NAME}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">IBAN :</span> {process.env.SCHOOL_IBAN}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Communication :</span> {student.firstName} {student.lastName} —{" "}
                  {new Date().toLocaleDateString("fr-BE", { month: "long", year: "numeric" })}
                </p>

                {student.paymentRequested ? (
                  <div className="mt-3 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-800 font-medium">
                    Virement déclaré — en attente de confirmation par l'administration.
                  </div>
                ) : (
                  <form action={requestPayment} className="mt-3">
                    <button
                      type="submit"
                      className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                      J'ai effectué mon virement
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Mes cours</h2>
        {student.enrollments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-700">Vous n'êtes inscrit à aucun cours pour le moment.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {student.enrollments.map((enrollment) => (
              <div key={enrollment.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="font-medium text-slate-950">{enrollment.course.title}</p>
                <p className="text-sm text-slate-700">
                  Inscription enregistrée le{" "}
                  {new Date(enrollment.createdAt).toLocaleDateString("fr-BE")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Mes ressources</h2>
        {resourcesWithUrls.length === 0 ? (
          <p className="mt-3 text-sm text-slate-700">Aucune ressource disponible pour le moment.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {resourcesWithUrls.map((resource) => (
              <div key={resource.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-950">{resource.title}</p>
                  {resource.description && (
                    <p className="text-sm text-slate-700">{resource.description}</p>
                  )}
                </div>
                <a>
                  href={resource.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline"
                  Télécharger
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}