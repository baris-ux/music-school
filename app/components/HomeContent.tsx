"use client";

import Link from "next/link";
import Image from "next/image";
import { Music, CalendarDays, MapPin, ArrowRight, BookOpen, Ticket, GraduationCap } from "lucide-react";
import { useLang } from "@/app/context/LangContext";
import { translations } from "@/lib/translations";

type Event = {
  id: string;
  title: string;
  startAt: Date;
  location: string;
  price: number;
};

export default function HomeContent({ upcomingEvents }: { upcomingEvents: Event[] }) {
  const { lang } = useLang();
  const t = translations[lang].home;

  const features = [
    {
      icon: BookOpen,
      title: lang === "fr" ? "Cours de musique" : "Müzik dersleri",
      description: lang === "fr"
        ? "Un accompagnement structuré pour progresser à votre rythme, quel que soit votre niveau."
        : "Seviyeniz ne olursa olsun, kendi hızınızda ilerlemeniz için yapılandırılmış bir destek.",
    },
    {
      icon: Ticket,
      title: lang === "fr" ? "Événements & concerts" : "Etkinlikler & konserler",
      description: lang === "fr"
        ? "Consultez les événements organisés par l'école et réservez vos billets en ligne."
        : "Okul tarafından düzenlenen etkinlikleri görüntüleyin ve biletlerinizi çevrimiçi ayırtın.",
    },
    {
      icon: GraduationCap,
      title: lang === "fr" ? "Espace étudiant" : "Öğrenci alanı",
      description: lang === "fr"
        ? "Accédez à vos cours, vos informations utiles et vos ressources pédagogiques."
        : "Derslerinize, yararlı bilgilerinize ve eğitim kaynaklarınıza erişin.",
    },
  ];

  const benefits = lang === "fr"
    ? [
        "Paiement sécurisé en ligne",
        "Billets envoyés par e-mail",
        "Accès étudiant simplifié",
        "École moderne et centralisée",
      ]
    : [
        "Güvenli çevrimiçi ödeme",
        "Biletler e-posta ile gönderilir",
        "Basitleştirilmiş öğrenci erişimi",
        "Modern ve merkezi okul",
      ];

  const gallery = [
    { src: "/images/cours_guitare_1.jpg", alt: lang === "fr" ? "Cours de guitare" : "Gitar dersi" },
    { src: "/images/cours_guitare_2.jpg", alt: lang === "fr" ? "Cours de guitare avancé" : "İleri gitar dersi" },
    { src: "/images/cours_luth_1.jpg", alt: lang === "fr" ? "Cours de luth" : "Ud dersi" },
    { src: "/images/cours_luth_2.webp", alt: lang === "fr" ? "Atelier luth" : "Ud atölyesi" },
    { src: "/images/cours_luth_3.webp", alt: lang === "fr" ? "Cours de luth en groupe" : "Grup ud dersi" },
  ];

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-slate-900">

      {/* ── Hero ── */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-slate-500 sm:mb-5">
              <Music size={11} className="stroke-[#d4a85a]" />
              {lang === "fr" ? "Cours de musique · Bruxelles" : "Müzik dersleri · Brüksel"}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-5xl lg:text-6xl">
              {t.title}
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-500 sm:mt-5 sm:text-base">
              {t.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
              <Link
                href="/event"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f1923] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1a2a38]"
              >
                {t.cta_tickets}
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
              >
                {t.cta_student}
              </Link>
            </div>
          </div>

          {/* Image hero */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <Image
              src="/images/image_de_groupe.jpg"
              alt="Étudiants de l'école de musique en cours"
              width={600}
              height={420}
              className="h-[260px] w-full object-cover sm:h-[320px] md:h-[360px]"
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f1923]/75 to-transparent p-4 sm:p-5">
              <p className="font-serif text-sm font-normal text-white sm:text-base">
                {lang === "fr" ? "Nos étudiants en action" : "Öğrencilerimiz dersте"}
              </p>
              <p className="mt-0.5 text-[11px] text-white/55 sm:text-[12px]">
                {lang === "fr" ? "Cours collectifs · Tous niveaux" : "Grup dersleri · Tüm seviyeler"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h2 className="font-sans text-xl font-semibold text-slate-950 sm:text-2xl">
            {lang === "fr" ? "Une plateforme pensée pour l'école" : "Okul için tasarlanmış bir platform"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            {lang === "fr"
              ? "Tout est organisé pour faciliter l'accès aux informations essentielles."
              : "Her şey temel bilgilere erişimi kolaylaştırmak için düzenlenmiştir."}
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1923]">
                  <Icon size={16} className="stroke-[#d4a85a]" />
                </div>
                <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Galerie ── */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h2 className="font-sans text-xl font-semibold text-slate-950 sm:text-2xl">
            {lang === "fr" ? "La vie à l'école" : "Okuldaki yaşam"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            {lang === "fr"
              ? "Guitare, luth, piano — découvrez l'ambiance de nos cours."
              : "Gitar, ud, piyano — derslerimizin atmosferini keşfedin."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
          {gallery.map((img, i) => (
            <div
              key={img.src}
              className={`overflow-hidden rounded-2xl border border-slate-200 ${
                i === 0 ? "col-span-2 md:col-span-1 md:row-span-2" : ""
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={800}
                height={600}
                className={`w-full object-cover transition duration-300 hover:scale-105 ${
                  i === 0 ? "h-48 sm:h-56 md:h-full md:min-h-[360px]" : "h-36 sm:h-44"
                }`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Bénéfices ── */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid md:grid-cols-2">
          <div className="relative hidden h-full min-h-[280px] md:block">
            <Image
              src="/images/cours_luth_1.jpg"
              alt="Cours de luth à l'école de musique"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#0f1923]/25" />
            <div className="absolute bottom-5 left-5">
              <span className="rounded-lg border border-white/20 bg-[#0f1923]/60 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white/70 backdrop-blur-sm">
                {lang === "fr" ? "Cours de luth" : "Ud dersi"}
              </span>
            </div>
          </div>

          <div className="relative h-40 md:hidden">
            <Image src="/images/cours_luth_1.jpg" alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-[#0f1923]/25" />
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">
              {lang === "fr" ? "Pourquoi choisir nos cours ?" : "Neden derslerimizi seçmelisiniz?"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              {lang === "fr"
                ? "Une expérience fluide pour les visiteurs, claire pour les élèves."
                : "Ziyaretçiler için akıcı, öğrenciler için net bir deneyim."}
            </p>

            <ul className="mt-5 space-y-3 sm:mt-6">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#d4a85a]/15">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#d4a85a]" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:mt-8"
            >
              {lang === "fr" ? "Nous contacter" : "Bize ulaşın"}
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Événements à venir ── */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <h2 className="font-sans text-xl font-semibold text-slate-950 sm:text-2xl">
              {lang === "fr" ? "Événements à venir" : "Yaklaşan etkinlikler"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {lang === "fr"
                ? "Les prochains rendez-vous de l'école de musique."
                : "Müzik okulunun yaklaşan etkinlikleri."}
            </p>
          </div>
          <Link
            href="/event"
            className="hidden text-sm font-medium text-slate-500 underline underline-offset-4 transition hover:text-slate-900 md:block"
          >
            {t.see_all}
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
            {t.no_events}
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
              >
                <div className="bg-[#0f1923] px-5 py-4">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-white/35">
                    {lang === "fr" ? "Événement" : "Etkinlik"}
                  </p>
                  <h3 className="font-sans text-sm font-medium text-white line-clamp-2 sm:text-base">
                    {event.title}
                  </h3>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-[12.5px] text-slate-500">
                      <CalendarDays size={13} className="flex-shrink-0 stroke-slate-400" />
                      {new Date(event.startAt).toLocaleDateString(
                        lang === "fr" ? "fr-BE" : "tr-TR",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[12.5px] text-slate-500">
                      <MapPin size={13} className="flex-shrink-0 stroke-slate-400" />
                      {event.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="font-sans text-base font-semibold text-slate-900 sm:text-lg">
                      {event.price === 0 ? t.free : `${(event.price / 100).toFixed(2)} €`}
                    </span>
                    <Link
                      href={`/event/${event.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f1923] px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-[#1a2a38]"
                    >
                      {t.book}
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-4 md:hidden">
          <Link
            href="/event"
            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 text-center text-sm font-medium text-slate-700 transition hover:border-slate-300"
          >
            {t.see_all}
          </Link>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="overflow-hidden rounded-2xl bg-[#0f1923]">
          <div className="grid md:grid-cols-2">
            <div className="relative hidden h-auto min-h-[220px] md:block">
              <Image
                src="/images/cours_guitare_2.jpg"
                alt="Cours de guitare à l'école de musique"
                fill
                className="object-cover opacity-50"
              />
            </div>

            <div className="px-6 py-8 sm:px-8 sm:py-10">
              <h2 className="font-sans text-xl font-semibold text-white sm:text-2xl">
                {lang === "fr" ? "Prêt à rejoindre nos cours ?" : "Derslerimize katılmaya hazır mısınız?"}
              </h2>
              <p className="mt-2 text-sm leading-7 text-white/45">
                {lang === "fr"
                  ? "Consultez les événements à venir ou connectez-vous à votre espace personnel."
                  : "Yaklaşan etkinliklere göz atın veya kişisel alanınıza giriş yapın."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
                <Link
                  href="/event"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#d4a85a] px-4 py-2.5 text-sm font-medium text-[#0f1923] transition hover:bg-[#c49a4e]"
                >
                  {lang === "fr" ? "Voir les événements" : "Etkinlikleri gör"}
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  {lang === "fr" ? "Se connecter" : "Giriş yap"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}