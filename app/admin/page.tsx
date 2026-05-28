import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfNextWeek = new Date(now);
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

  const [
    activeStudentsCount,
    pendingInscriptionsCount,
    paymentRequestedCount,
    upcomingSessionsCount,
    revenueResult,
    presentCount,
    totalAttendanceCount,
  ] = await Promise.all([
    prisma.student.count({ where: { user: { isActive: true } } }),
    prisma.inscriptionRequest.count({ where: { status: "PENDING" } }),
    prisma.student.count({ where: { paymentRequested: true } }),
    prisma.session.count({
      where: { startsAt: { gte: now, lte: endOfNextWeek }, status: "PLANNED" },
    }),
    prisma.student.aggregate({ _sum: { balance: true }, where: { balance: { gt: 0 } } }),
    prisma.attendance.count({ where: { status: "PRESENT", createdAt: { gte: startOfMonth } } }),
    prisma.attendance.count({ where: { createdAt: { gte: startOfMonth } } }),
  ]);

  const totalRevenueDue = (revenueResult._sum.balance ?? 0) / 100;
  const attendanceRate = totalAttendanceCount > 0
    ? Math.round((presentCount / totalAttendanceCount) * 100)
    : null;

  const stats = [
    {
      label: "Étudiants actifs",
      value: activeStudentsCount,
      suffix: "",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      href: "/admin/students",
    },
    {
      label: "Demandes en attente",
      value: pendingInscriptionsCount,
      suffix: "",
      color: pendingInscriptionsCount > 0 ? "text-amber-600" : "text-slate-600",
      bg: pendingInscriptionsCount > 0 ? "bg-amber-50" : "bg-slate-50",
      border: pendingInscriptionsCount > 0 ? "border-amber-100" : "border-slate-200",
      href: "/admin/inscriptions",
    },
    {
      label: "Virements à confirmer",
      value: paymentRequestedCount,
      suffix: "",
      color: paymentRequestedCount > 0 ? "text-green-600" : "text-slate-600",
      bg: paymentRequestedCount > 0 ? "bg-green-50" : "bg-slate-50",
      border: paymentRequestedCount > 0 ? "border-green-100" : "border-slate-200",
      href: "/admin/students",
    },
    {
      label: "Total dû par les étudiants",
      value: totalRevenueDue.toFixed(2),
      suffix: " €",
      color: totalRevenueDue > 0 ? "text-red-600" : "text-slate-600",
      bg: totalRevenueDue > 0 ? "bg-red-50" : "bg-slate-50",
      border: totalRevenueDue > 0 ? "border-red-100" : "border-slate-200",
      href: "/admin/students",
    },
    {
      label: "Séances cette semaine",
      value: upcomingSessionsCount,
      suffix: "",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
      href: "/admin/sessions",
    },
    {
      label: "Taux de présence (ce mois)",
      value: attendanceRate !== null ? attendanceRate : "—",
      suffix: attendanceRate !== null ? " %" : "",
      color: "text-slate-700",
      bg: "bg-slate-50",
      border: "border-slate-200",
      href: "/admin/sessions",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-700">
          Connecté en tant que <span className="font-medium">{session.email}</span>
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-2xl border ${stat.border} ${stat.bg} p-5 shadow-sm transition hover:opacity-80`}
          >
            <p className="text-sm text-slate-600">{stat.label}</p>
            <p className={`mt-1 text-3xl font-bold ${stat.color}`}>
              {stat.value}{stat.suffix}
            </p>
          </Link>
        ))}
      </div>

      {/* Accès rapide */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-950">Accès rapide</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/admin/students", label: "Étudiants", desc: "Gérer les comptes" },
            { href: "/admin/courses", label: "Cours", desc: "Gérer les cours" },
            { href: "/admin/sessions", label: "Séances", desc: "Planifier les séances" },
            { href: "/admin/inscriptions", label: "Inscriptions", desc: "Traiter les demandes" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-950">{link.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
