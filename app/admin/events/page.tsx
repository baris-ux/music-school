import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import CopyButton from "./CopyButton";
import GeneratePaperTicketsButton from "./GeneratePaperTicketsButton";

function formatDateTimeLocal(date: Date | string) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function createEvent(formData: FormData) {
  "use server";

  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const startAtRaw = String(formData.get("startAt") ?? "").trim();
  const endAtRaw = String(formData.get("endAt") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const capacity = Number(formData.get("capacity") ?? 0);

  if (!title || !location || !startAtRaw || price < 0 || capacity <= 0) {
    throw new Error("Champs obligatoires invalides");
  }

  const startAt = new Date(startAtRaw);
  if (Number.isNaN(startAt.getTime())) throw new Error("Date de début invalide");

  const endAt = endAtRaw ? new Date(endAtRaw) : null;
  if (endAt && Number.isNaN(endAt.getTime())) throw new Error("Date de fin invalide");

  await prisma.event.create({
    data: { title, description, location, startAt, endAt, price, capacity },
  });

  revalidatePath("/admin/events");
}

async function deleteEvent(formData: FormData) {
  "use server";

  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/events");
}

async function updateEvent(formData: FormData) {
  "use server";

  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const id = String(formData.get("id") ?? "");
  const description = String(formData.get("description") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const startAtRaw = String(formData.get("startAt") ?? "").trim();
  const endAtRaw = String(formData.get("endAt") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const capacity = Number(formData.get("capacity") ?? 0);

  if (!id || !title || !location || !startAtRaw || price < 0 || capacity <= 0) {
    throw new Error("Données invalides pour la modification de l'événement.");
  }

  const startAt = new Date(startAtRaw);
  if (Number.isNaN(startAt.getTime())) throw new Error("Date de début invalide.");

  const endAt = endAtRaw ? new Date(endAtRaw) : null;
  if (endAt && Number.isNaN(endAt.getTime())) throw new Error("Date de fin invalide.");

  const existingEvent = await prisma.event.findUnique({ where: { id } });
  if (!existingEvent) throw new Error("Événement introuvable.");

  await prisma.event.update({
    where: { id },
    data: { title, description, location, startAt, endAt, price, capacity },
  });

  revalidatePath("/admin/events");
}

async function generateScanToken(formData: FormData) {
  "use server";

  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const eventId = String(formData.get("eventId") ?? "");
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Événement introuvable.");

  // Expire à la fin de l'événement, ou à minuit du jour de début si pas de endAt
  const expiresAt = event.endAt ?? new Date(new Date(event.startAt).setHours(23, 59, 59, 999));

  await prisma.scanToken.upsert({
    where: { eventId },
    update: { expiresAt },
    create: { eventId, expiresAt },
  });

  revalidatePath("/admin/events");
}

async function revokeScanToken(formData: FormData) {
  "use server";

  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const eventId = String(formData.get("eventId") ?? "");
  await prisma.scanToken.deleteMany({ where: { eventId } });
  revalidatePath("/admin/events");
}

export default async function EventsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/");

  const events = await prisma.event.findMany({
    orderBy: { startAt: "asc" },
    include: {
      scanToken: true,
      tickets: { select: { isPaperTicket: true } },
    },
  });

  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Événements</h1>
        <p className="mt-1 text-sm text-slate-700">
          Créez et gérez les événements de l'académie.
        </p>
      </div>

      {/* Formulaire de création */}
      <form
        action={createEvent}
        className="max-w-xl space-y-5 rounded-2xl border border-slate-300 bg-slate-50 p-6 shadow-sm"
      >
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium text-slate-900">
            Titre de l'événement
          </label>
          <input
            id="title"
            name="title"
            placeholder="Ex. Concert de fin d'année"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 placeholder:text-slate-600 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium text-slate-900">
            Description de l'événement
          </label>
          <input
            id="description"
            name="description"
            placeholder="Ex. présentation des progrès réalisés par nos étudiants"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 placeholder:text-slate-600 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="location" className="text-sm font-medium text-slate-900">
            Lieu
          </label>
          <input
            id="location"
            name="location"
            placeholder="Ex. Salle communale"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 placeholder:text-slate-600 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="startAt" className="text-sm font-medium text-slate-900">
              Date et heure de début
            </label>
            <input
              id="startAt"
              name="startAt"
              type="datetime-local"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="endAt" className="text-sm font-medium text-slate-900">
              Date et heure de fin <span className="text-slate-400">(optionnel)</span>
            </label>
            <input
              id="endAt"
              name="endAt"
              type="datetime-local"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="price" className="text-sm font-medium text-slate-900">
              Prix (en centimes)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              placeholder="Ex. 1500"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 placeholder:text-slate-600 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="capacity" className="text-sm font-medium text-slate-900">
              Capacité maximale
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              placeholder="Ex. 100"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 placeholder:text-slate-600 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 cursor-pointer"
        >
          Créer l'événement
        </button>
      </form>

      {/* Liste des événements */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-sm text-slate-700">Aucun événement pour le moment.</p>
        ) : (
          events.map((event) => {
            const scanUrl = event.scanToken
              ? `${baseUrl}/scan/${event.scanToken.token}`
              : null;
            const isExpired = event.scanToken
              ? event.scanToken.expiresAt < new Date()
              : false;
            const onlineCount = event.tickets.filter((t) => !t.isPaperTicket).length;
            const paperCount = event.tickets.filter((t) => t.isPaperTicket).length;
            const remaining = event.capacity - event.tickets.length;
            const isFull = remaining <= 0;

            return (
              <div
                key={event.id}
                className="space-y-4 rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm"
              >
                {/* En-tête événement */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-950">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-sm text-slate-700 mt-1">{event.description}</p>
                    )}
                    <p className="text-sm text-slate-700">{event.location}</p>
                    <p className="text-sm text-slate-700">
                      Début :{" "}
                      {new Date(event.startAt).toLocaleString("fr-BE", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                      {event.endAt && (
                        <>
                          {" "}→{" "}
                          {new Date(event.endAt).toLocaleString("fr-BE", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </>
                      )}
                    </p>
                    <p className="text-sm text-slate-700">
                      Prix : {(event.price / 100).toFixed(2)} €
                    </p>
                  </div>

                  <form action={deleteEvent}>
                    <input type="hidden" name="id" value={event.id} />
                    <button
                      type="submit"
                      className="rounded-lg px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </form>
                </div>

                {/* Billetterie */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-900">Billetterie</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="text-xs text-slate-500">En ligne</p>
                      <p className="text-lg font-bold text-slate-900">{onlineCount}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="text-xs text-slate-500">Papier</p>
                      <p className="text-lg font-bold text-slate-900">{paperCount}</p>
                    </div>
                    <div className={`rounded-lg border px-3 py-2 ${isFull ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
                      <p className="text-xs text-slate-500">Restant</p>
                      <p className={`text-lg font-bold ${isFull ? "text-red-600" : "text-green-600"}`}>{remaining}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Générer des billets papier à imprimer</p>
                    <GeneratePaperTicketsButton eventId={event.id} remaining={remaining} />
                  </div>
                </div>

                {/* Lien de scan */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-900">
                    Accès scan externe
                  </p>

                  {scanUrl ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            isExpired
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isExpired ? "Expiré" : "Actif"}
                        </span>
                        <span className="text-xs text-slate-500">
                          Expire le{" "}
                          {new Date(event.scanToken!.expiresAt).toLocaleString("fr-BE", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <code className="flex-1 truncate text-xs text-slate-600">
                          {scanUrl}
                        </code>
                      </div>

                      <div className="flex gap-2">
                        {/* Bouton copier (client-side via form trick) */}
                        <CopyButton url={scanUrl} />

                        {/* Regénérer */}
                        <form action={generateScanToken}>
                          <input type="hidden" name="eventId" value={event.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                          >
                            Regénérer
                          </button>
                        </form>

                        {/* Révoquer */}
                        <form action={revokeScanToken}>
                          <input type="hidden" name="eventId" value={event.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 cursor-pointer"
                          >
                            Révoquer
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <form action={generateScanToken}>
                      <input type="hidden" name="eventId" value={event.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 cursor-pointer"
                      >
                        Générer un lien de scan
                      </button>
                    </form>
                  )}
                </div>

                {/* Formulaire de modification */}
                <form
                  action={updateEvent}
                  className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"
                >
                  <input type="hidden" name="id" value={event.id} />

                  <input
                    name="title"
                    defaultValue={event.title}
                    placeholder="Titre"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                    required
                  />

                  <input
                    name="description"
                    defaultValue={event.description ?? ""}
                    placeholder="Description"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                  />

                  <input
                    name="location"
                    defaultValue={event.location}
                    placeholder="Lieu"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                    required
                  />

                  <input
                    name="startAt"
                    type="datetime-local"
                    defaultValue={formatDateTimeLocal(event.startAt)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                    required
                  />

                  <input
                    name="endAt"
                    type="datetime-local"
                    defaultValue={event.endAt ? formatDateTimeLocal(event.endAt) : ""}
                    placeholder="Fin (optionnel)"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                  />

                  <input
                    name="price"
                    type="number"
                    min={0}
                    defaultValue={event.price}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                    required
                  />

                  <input
                    name="capacity"
                    type="number"
                    min={1}
                    defaultValue={event.capacity}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                    required
                  />

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 md:col-span-2 cursor-pointer"
                  >
                    Enregistrer les modifications
                  </button>
                </form>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}