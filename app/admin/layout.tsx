import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/admin", label: "Accueil" },
  { href: "/admin/students", label: "Étudiants" },
  { href: "/admin/courses", label: "Cours" },
  { href: "/admin/events", label: "Événements" },
  { href: "/admin/sessions", label: "Sessions" },
  { href: "/admin/inscriptions", label: "Demandes d'inscription" },
  { href: "/admin/ressources", label: "Gérer les ressources" },
  { href: "/admin/tarifs", label: "Tarifs" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-300 bg-white p-6 shadow-md lg:block">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Music Academy
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">
              Admin
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Gérez l’académie depuis une interface claire et centralisée.
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-200 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-900">Conseil</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Vérifie toujours les inscriptions avant de supprimer un étudiant ou un cours.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="rounded-3xl border border-slate-300 bg-white px-6 py-5 shadow-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Dashboard administrateur
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  Gestion de la plateforme
                </h2>
              </div>

              <Link
                href="/logout"
                prefetch={false}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 hover:text-slate-950"
              >
                Se déconnecter
              </Link>
            </div>
          </header>

          <main className="min-w-0 rounded-3xl border border-slate-300 bg-white p-6 shadow-md sm:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}