"use client";

import { useActionState } from "react";
import { submitContact } from "./actions";
import { useLang } from "@/app/context/LangContext";
import { translations } from "@/lib/translations";

export default function ContactForm() {
  const { lang } = useLang();
  const t = translations[lang].contact;

  const [state, formAction, pending] = useActionState(submitContact, {
    error: null,
    success: null,
  });

  return (
    <form action={formAction} className="space-y-4">
      <input
        type="text"
        name="name"
        placeholder={t.form_name}
        required
        className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-slate-500"
      />
      <input
        type="email"
        name="email"
        placeholder={t.form_email}
        required
        className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-slate-500"
      />
      <textarea
        name="message"
        placeholder={t.form_message}
        rows={5}
        required
        className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-slate-500"
      />
      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {t.form_error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {t.form_success}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? t.form_pending : t.form_submit}
      </button>
    </form>
  );
}