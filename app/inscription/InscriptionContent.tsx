"use client";

import { useLang } from "@/app/context/LangContext";
import { translations } from "@/lib/translations";
import InscriptionForm from "./InscriptionForm";

type Course = { id: string; title: string };

export default function InscriptionContent({ cours }: { cours: Course[] }) {
  const { lang } = useLang();
  const t = translations[lang].inscription;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-950">{t.title}</h1>
          <p className="mt-1 text-sm text-slate-700">{t.subtitle}</p>
        </div>
        <InscriptionForm cours={cours} />
      </div>
    </div>
  );
}