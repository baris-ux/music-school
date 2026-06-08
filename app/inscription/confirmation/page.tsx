"use client";

import { useLang } from "@/app/context/LangContext";
import { translations } from "@/lib/translations";

export default function ConfirmationPage() {
  const { lang } = useLang();
  const t = translations[lang].inscription_confirmation;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-xl text-center">
        <div className="rounded-2xl border border-slate-300 bg-white p-10 shadow-sm">
          <div className="mb-4 text-4xl">🎵</div>
          <h1 className="text-2xl font-semibold text-slate-950">{t.title}</h1>
          <p className="mt-3 text-sm text-slate-700">{t.message}</p>
          <p className="mt-2 text-sm text-slate-500">{t.email_sent}</p>
          <a
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {t.back_home}
          </a>
        </div>
      </div>
    </div>
  );
}
