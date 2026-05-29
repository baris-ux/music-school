import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createPricing, cancelPendingPricing } from "./actions";

function formatEuros(cents: number) {
  return (cents / 100).toFixed(2) + " €";
}

export default async function AdminTarifsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/");

  const [activePricing, pendingPricing] = await Promise.all([
    prisma.pricingConfig.findFirst({
      where: { appliedAt: { not: null } },
      orderBy: { appliedAt: "desc" },
    }),
    prisma.pricingConfig.findFirst({
      where: { appliedAt: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const minDate = new Date();
  minDate.setMonth(minDate.getMonth() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Gestion des tarifs</h1>
        <p className="mt-1 text-sm text-slate-700">
          Tout changement de tarif nécessite un préavis d'au minimum 1 mois.
          Les étudiants sont notifiés par email automatiquement.
        </p>
      </div>

      {/* Tarifs actuels */}
      <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-950">Tarifs actuels</h2>
        {activePricing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">À la séance</p>
              <p className="text-2xl font-bold text-slate-950 mt-1">{formatEuros(activePricing.perSessionCents)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Mensuel</p>
              <p className="text-2xl font-bold text-slate-950 mt-1">{formatEuros(activePricing.monthlyCents)}<span className="text-sm font-normal text-slate-500"> /mois</span></p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">À la séance</p>
              <p className="text-2xl font-bold text-slate-950 mt-1">17,50 €</p>
              <p className="text-xs text-slate-400 mt-1">Tarif par défaut</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Mensuel</p>
              <p className="text-2xl font-bold text-slate-950 mt-1">50,00 €<span className="text-sm font-normal text-slate-500"> /mois</span></p>
              <p className="text-xs text-slate-400 mt-1">Tarif par défaut</p>
            </div>
          </div>
        )}
      </div>

      {/* Changement planifié */}
      {pendingPricing && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-amber-900">Changement planifié</h2>
              <p className="text-sm text-amber-700 mt-0.5">
                Entrée en vigueur le{" "}
                <strong>
                  {new Date(pendingPricing.effectiveFrom).toLocaleDateString("fr-BE", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </strong>
              </p>
            </div>
            <form action={cancelPendingPricing}>
              <button
                type="submit"
                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                Annuler ce changement
              </button>
            </form>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-amber-200 bg-white px-4 py-3">
              <p className="text-xs text-amber-600">À la séance</p>
              <p className="text-2xl font-bold text-slate-950 mt-1">{formatEuros(pendingPricing.perSessionCents)}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-white px-4 py-3">
              <p className="text-xs text-amber-600">Mensuel</p>
              <p className="text-2xl font-bold text-slate-950 mt-1">{formatEuros(pendingPricing.monthlyCents)}<span className="text-sm font-normal text-slate-500"> /mois</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire nouveau tarif */}
      {!pendingPricing && (
        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Planifier un nouveau tarif</h2>
          <p className="mt-1 text-sm text-slate-600">
            Un email sera automatiquement envoyé à tous les étudiants actifs lors de la confirmation.
          </p>
          <form action={createPricing} className="mt-5 space-y-4 max-w-md">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-900">Tarif à la séance (€)</label>
                <input
                  name="perSession"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="17.50"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-950 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-900">Tarif mensuel (€)</label>
                <input
                  name="monthly"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="50.00"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-950 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-900">Date d'entrée en vigueur</label>
              <input
                name="effectiveFrom"
                type="date"
                min={minDateStr}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-950 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
              />
              <p className="text-xs text-slate-500">Minimum 1 mois à partir d'aujourd'hui.</p>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Planifier et notifier les étudiants
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
