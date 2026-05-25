"use client";

import { useState } from "react";
import { soumettreInscription } from "./actions";
import { useLang } from "@/app/context/LangContext";
import { translations } from "@/lib/translations";

type Course = { id: string; title: string };

export default function InscriptionForm({ cours }: { cours: Course[] }) {
  const [isParent, setIsParent] = useState(false);
  const { lang } = useLang();
  const t = translations[lang].inscription;

  return (
    <form
      action={soumettreInscription}
      className="space-y-6 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm"
    >
      {/* Informations de l'étudiant */}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.section_student}
        </p>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-sm font-medium text-slate-900">
                {t.first_name} <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                placeholder="Ex. Jean"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 placeholder:text-slate-600 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="text-sm font-medium text-slate-900">
                {t.last_name} <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                placeholder="Ex. Dupont"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 placeholder:text-slate-600 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                required
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="isParent"
              checked={isParent}
              onChange={(e) => setIsParent(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm text-slate-900">{t.is_parent}</span>
          </label>
        </div>
      </div>

      {/* Champs parent si coché */}
      {isParent && (
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t.section_parent}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="parentFirstName" className="text-sm font-medium text-slate-900">
                {t.parent_first_name} <span className="text-red-500">*</span>
              </label>
              <input
                id="parentFirstName"
                name="parentFirstName"
                placeholder="Ex. Marie"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 placeholder:text-slate-600 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="parentLastName" className="text-sm font-medium text-slate-900">
                {t.parent_last_name} <span className="text-red-500">*</span>
              </label>
              <input
                id="parentLastName"
                name="parentLastName"
                placeholder="Ex. Dupont"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 placeholder:text-slate-600 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Coordonnées de contact */}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.section_contact}
        </p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-900">
              {t.email} <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500">
              {isParent ? t.email_hint_parent : t.email_hint}
            </p>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="jean.dupont@email.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 placeholder:text-slate-600 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phoneNumber" className="text-sm font-medium text-slate-900">
              {t.phone}
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="Ex. +32 470 00 00 00"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 placeholder:text-slate-600 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>
      </div>

      {/* Cours souhaités */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-900">
          {t.courses} <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2 rounded-xl border border-slate-300 bg-white p-4">
          {cours.map((course) => (
            <label key={course.id} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="courseIds"
                value={course.id}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-900">{course.title}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium text-slate-900">
          {t.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder={t.message_placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-950 placeholder:text-slate-600 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        {t.submit}
      </button>
    </form>
  );
}