"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLang } from "@/app/context/LangContext";
import { translations } from "@/lib/translations";
import { ArrowRight, Banknote, Building2, Music2 } from "lucide-react";

type PendingPricing = {
  perSessionCents: number;
  monthlyCents: number;
  effectiveFrom: string;
};

type Props = {
  activePerSession: number;
  activeMonthly: number;
  pendingPricing: PendingPricing | null;
};

function formatEuros(cents: number) {
  return (cents / 100).toLocaleString("fr-BE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}

export default function TarifsContent({ activePerSession, activeMonthly, pendingPricing }: Props) {
  const { lang } = useLang();
  const t = translations[lang].pricing;

  const effectiveDate = pendingPricing
    ? new Date(pendingPricing.effectiveFrom).toLocaleDateString(
        lang === "tr" ? "tr-TR" : "fr-BE",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f8f7f4] text-slate-900">

        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
            {t.subtitle}
          </p>
        </section>

        {/* Cartes tarifs */}
        <section className="mx-auto max-w-4xl px-4 pb-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">

            {/* À la séance */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {t.per_session}
              </p>
              <p className="mt-3 text-4xl font-bold text-slate-950">
                {formatEuros(activePerSession)}
                <span className="ml-1 text-base font-normal text-slate-400">{t.per_session_unit}</span>
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                {t.per_session_desc}
              </p>
            </div>

            {/* Mensuel */}
            <div className="rounded-2xl border-2 border-[#0f1923] bg-[#0f1923] p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                {t.monthly}
              </p>
              <p className="mt-3 text-4xl font-bold text-white">
                {formatEuros(activeMonthly)}
                <span className="ml-1 text-base font-normal text-white/50">{t.monthly_unit}</span>
              </p>
              <p className="mt-4 text-sm leading-6 text-white/70">
                {t.monthly_desc}
              </p>
            </div>
          </div>
        </section>

        {/* Avertissement tarif en attente */}
        {pendingPricing && (
          <section className="mx-auto max-w-4xl px-4 pb-8 pt-4 sm:px-6">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {t.pending_from}{" "}
              <strong>{effectiveDate}</strong>{" "}
              : {formatEuros(pendingPricing.perSessionCents)}{t.per_session_unit} — {formatEuros(pendingPricing.monthlyCents)}{t.monthly_unit}
            </div>
          </section>
        )}

        {/* Cours disponibles */}
        <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-950">{t.courses_title}</h2>
            <p className="mt-1 text-sm text-slate-400">{t.same_price}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f1923]">
                  <Music2 size={14} className="stroke-[#d4a85a]" />
                </div>
                <span className="text-sm font-medium text-slate-900">{t.guitar}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f1923]">
                  <Music2 size={14} className="stroke-[#d4a85a]" />
                </div>
                <span className="text-sm font-medium text-slate-900">{t.luth}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Modalités de paiement */}
        <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-950">{t.payment_title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{t.payment_desc}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#0f1923]">
                  <Banknote size={14} className="stroke-[#d4a85a]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{t.cash}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t.cash_desc}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#0f1923]">
                  <Building2 size={14} className="stroke-[#d4a85a]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{t.transfer}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t.transfer_desc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
          <div className="rounded-2xl bg-[#0f1923] px-6 py-8 sm:px-8">
            <p className="text-lg font-semibold text-white">{t.question}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/inscription"
                className="inline-flex items-center gap-2 rounded-xl bg-[#d4a85a] px-4 py-2.5 text-sm font-medium text-[#0f1923] transition hover:bg-[#c49a4e]"
              >
                {t.cta}
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {t.contact_us}
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
