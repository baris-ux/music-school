import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { accepterInscription, refuserInscription } from "./actions";

export default async function InscriptionsAdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/");

  const demandes = await prisma.inscriptionRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      courses: { include: { course: true } },
    },
  });

  const enAttente = demandes.filter((d) => d.status === "PENDING");
  const traitees = demandes.filter((d) => d.status !== "PENDING");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">
          Demandes d'inscription
        </h1>
        <p className="mt-1 text-sm text-slate-700">
          Examinez et traitez les demandes d'inscription des nouveaux étudiants.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">
          En attente{" "}
          <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            {enAttente.length}
          </span>
        </h2>

        {enAttente.length === 0 ? (
          <p className="text-sm text-slate-700">Aucune demande en attente.</p>
        ) : (
          enAttente.map((demande) => (
            <div
              key={demande.id}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-4 shadow-sm space-y-3"
            >
              <div>
                <p className="text-base font-semibold text-slate-950">
                  {demande.firstName} {demande.lastName}
                </p>
                <p className="text-sm text-slate-700">{demande.email}</p>
                {demande.phoneNumber && (
                  <p className="text-sm text-slate-700">{demande.phoneNumber}</p>
                )}
                {demande.isParent && (
                  <p className="mt-1 text-sm text-slate-700">
                    Parent : {demande.parentFirstName} {demande.parentLastName}
                  </p>
                )}
                {demande.courses.length > 0 && (
                  <p className="mt-1 text-sm text-slate-700">
                    Cours demandés :{" "}
                    {demande.courses.map((c) => c.course.title).join(", ")}
                  </p>
                )}
                {demande.message && (
                  <p className="mt-2 text-sm text-slate-600 italic">
                    "{demande.message}"
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  Reçue le{" "}
                  {new Date(demande.createdAt).toLocaleDateString("fr-BE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="flex gap-3">
                <form action={accepterInscription}>
                  <input type="hidden" name="id" value={demande.id} />
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Accepter
                  </button>
                </form>

                <form action={refuserInscription}>
                  <input type="hidden" name="id" value={demande.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                  >
                    Refuser
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

      {traitees.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Traitées</h2>
          {traitees.map((demande) => (
            <div
              key={demande.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-medium text-slate-800">
                    {demande.firstName} {demande.lastName}
                  </p>
                  <p className="text-sm text-slate-600">{demande.email}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    demande.status === "ACCEPTED"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {demande.status === "ACCEPTED" ? "Acceptée" : "Refusée"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}