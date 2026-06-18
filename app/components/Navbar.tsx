"use client";

import Link from "next/link";
import { Music } from "lucide-react";
import { useLang } from "@/app/context/LangContext";
import { translations } from "@/lib/translations";

export function LangSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1 text-xs font-medium">
      <button
        onClick={() => setLang("fr")}
        className={lang === "fr" ? "text-slate-900 font-semibold" : "text-slate-400 hover:text-slate-600 transition"}
      >
        FR
      </button>
      <span className="text-slate-300">|</span>
      <button
        onClick={() => setLang("tr")}
        className={lang === "tr" ? "text-slate-900 font-semibold" : "text-slate-400 hover:text-slate-600 transition"}
      >
        TR
      </button>
    </div>
  );
}

export default function Navbar() {
  const { lang } = useLang();
  const t = translations[lang].nav;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-[#f8f7f4]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f1923]">
            <Music size={14} className="stroke-[#d4a85a]" />
          </div>
          <span className="font-sans text-sm font-medium tracking-wide text-slate-900 sm:text-base">
            École de musique
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
          <Link href="/" className="transition hover:text-slate-900">{t.home}</Link>
          <Link href="/event" className="transition hover:text-slate-900">{t.events}</Link>
          <Link href="/contact" className="transition hover:text-slate-900">{t.contact}</Link>
          <Link href="/inscription" className="transition hover:text-slate-900">{t.inscription}</Link>
          <Link href="/tarifs" className="transition hover:text-slate-900">{t.pricing}</Link>
        </nav>

        <div className="flex items-center gap-3">
          <LangSwitcher />
          <Link
            href="/login"
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:px-4 sm:py-2 sm:text-sm"
          >
            {t.login}
          </Link>
          <Link
            href="/event"
            className="rounded-xl bg-[#0f1923] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#1a2a38] sm:px-4 sm:py-2 sm:text-sm"
          >
            {t.events}
          </Link>
        </div>
      </div>
    </header>
  );
}