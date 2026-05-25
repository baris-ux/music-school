"use client";

import Link from "next/link";
import { useLang } from "@/app/context/LangContext";
import { translations } from "@/lib/translations";

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startAt: Date;
  price: number;
};

export default function EventDetailContent({ event }: { event: Event }) {
  const { lang } = useLang();
  const t = translations[lang].events;

  const formattedDate = new Date(event.startAt).toLocaleString(
    lang === "fr" ? "fr-BE" : "tr-TR",
    { dateStyle: "full", timeStyle: "short" }
  );

  const formattedPrice = new Intl.NumberFormat(
    lang === "fr" ? "fr-BE" : "tr-TR",
    { style: "currency", currency: "EUR" }
  ).format(event.price / 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/event"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            {t.back}
          </Link>
        </div>

        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-6 py-10 text-white sm:px-8">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-100">
              {t.event_label}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {event.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
              {t.event_subtitle}
            </p>
          </div>

          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-semibold text-slate-950">{t.about}</h2>
                {event.description ? (
                  <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
                    {event.description}
                  </p>
                ) : (
                  <p className="mt-3 text-sm italic text-slate-500">
                    {t.no_description_detail}
                  </p>
                )}
              </section>
            </div>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-base font-semibold text-slate-950">
                {t.practical_info}
              </h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t.location}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    📍 {event.location}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t.date_time}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    🗓️ {formattedDate}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t.price}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    🎟️ {formattedPrice}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={`/event/${event.id}/checkout`}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  {t.continue}
                </Link>
                <Link
                  href="/event"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                >
                  {t.back}
                </Link>
              </div>
            </aside>
          </div>
        </article>
      </div>
    </div>
  );
}