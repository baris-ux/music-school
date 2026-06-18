"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAttendance, AttendanceRecord } from "./actions";
import type { AttendanceStatus } from "@/generated/prisma/enums";

// ── Types ──────────────────────────────────────────────────────────────────
type Student = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
};

type Enrollment = {
  student: Student;
};

type Attendance = {
  studentId: string;
  status: AttendanceStatus;
};

type Session = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  course: { title: string; id: string };
  attendances: Attendance[];
};

type Props = {
  session: Session;
  enrollments: Enrollment[];
};

// ── Config statuts ─────────────────────────────────────────────────────────
type DisplayStatus = "PRESENT" | "ABSENT";

const STATUS_CONFIG: Record<
  DisplayStatus,
  { label: string; icon: string; colors: string; badge: string; dot: string }
> = {
  PRESENT: {
    label: "Présent",
    icon: "✓",
    colors: "border-green-300 bg-green-50 text-green-700 hover:bg-green-100",
    badge: "bg-green-100 text-green-700 border border-green-200",
    dot: "bg-green-500",
  },
  ABSENT: {
    label: "Absent",
    icon: "✕",
    colors: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
    badge: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
};

const ALL_STATUSES: DisplayStatus[] = ["PRESENT", "ABSENT"];

// ── Composant ligne étudiant ───────────────────────────────────────────────
function StudentRow({
  student,
  status,
  onChange,
}: {
  student: Student;
  status: AttendanceStatus | undefined;
  onChange: (studentId: string, status: AttendanceStatus) => void;
}) {
  const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
  const displayStatus: DisplayStatus | undefined =
    status === "PRESENT" || status === "ABSENT" ? status : undefined;
  const cfg = displayStatus ? STATUS_CONFIG[displayStatus] : null;

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-150 ${
        cfg
          ? `border-${displayStatus === "PRESENT" ? "green" : "red"}-200 bg-${displayStatus === "PRESENT" ? "green" : "red"}-50/40`
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0 transition-colors duration-150 ${
          cfg
            ? displayStatus === "PRESENT"
              ? "bg-green-500"
              : "bg-red-500"
            : "bg-gray-300"
        }`}
      >
        {initials}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">
          {student.firstName} {student.lastName}
        </p>
        {student.phoneNumber && (
          <p className="text-xs text-gray-400 truncate">{student.phoneNumber}</p>
        )}
      </div>

      {/* Badge statut */}
      {cfg && (
        <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      )}

      {/* Boutons */}
      <div className="flex gap-1.5 shrink-0">
        {ALL_STATUSES.map((s) => {
          const c = STATUS_CONFIG[s];
          const isActive = status === s;
          return (
            <button
              key={s}
              onClick={() => onChange(student.id, s)}
              title={c.label}
              className={`w-9 h-9 rounded-lg border-2 text-sm font-bold transition-all duration-150 cursor-pointer ${
                isActive
                  ? s === "PRESENT"
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-red-500 border-red-500 text-white"
                  : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
              }`}
            >
              {c.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────
export default function AttendanceClient({ session, enrollments }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    () =>
      Object.fromEntries(
        session.attendances.map((a) => [a.studentId, a.status])
      )
  );
  const [savedOnce, setSavedOnce] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | "all" | "pending">("all");

  const students = enrollments.map((e) => e.student);

  const stats = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, pending: 0 };
    students.forEach((s) => {
      const st = attendance[s.id];
      if (st === "PRESENT") counts.PRESENT++;
      else if (st === "ABSENT") counts.ABSENT++;
      else counts.pending++;
    });
    return counts;
  }, [attendance, students]);

  const completion = students.length
    ? Math.round(((students.length - stats.pending) / students.length) * 100)
    : 0;

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filterStatus === "all"
          ? true
          : filterStatus === "pending"
          ? !attendance[s.id]
          : attendance[s.id] === filterStatus;
      return matchSearch && matchFilter;
    });
  }, [students, search, filterStatus, attendance]);

  const handleChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setSavedOnce(false);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const all: Record<string, AttendanceStatus> = {};
    students.forEach((s) => (all[s.id] = status));
    setAttendance(all);
    setSavedOnce(false);
  };

  const handleSave = () => {
    const records: AttendanceRecord[] = Object.entries(attendance).map(
      ([studentId, status]) => ({ studentId, status })
    );
    startTransition(async () => {
      await saveAttendance(session.id, records);
      setSavedOnce(true);
    });
  };

  const dateLabel = new Date(session.startsAt).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startTime = new Date(session.startsAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = new Date(session.endsAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-5">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          ← Retour aux sessions
        </button>

        <div className="bg-gray-900 text-white rounded-2xl p-6">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-2">
            Prise des présences
          </p>
          <h1 className="text-xl font-bold mb-1">{session.course.title}</h1>
          <p className="text-sm text-gray-400 capitalize">{dateLabel}</p>
          <p className="text-sm text-gray-400">{startTime} – {endTime}</p>

          <div className="mt-5">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Progression</span>
              <span className="text-gray-200 font-semibold">
                {students.length - stats.pending}/{students.length} étudiants
              </span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completion === 100 ? "bg-green-400" : "bg-indigo-400"
                }`}
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <p className={`text-2xl font-bold ${
                  s === "PRESENT" ? "text-green-600" : "text-red-600"
                }`}>
                  {s === "PRESENT" ? stats.PRESENT : stats.ABSENT}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{cfg.label}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-medium mr-1">Tout marquer :</span>
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => handleMarkAll(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 cursor-pointer transition-colors ${cfg.colors}`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Rechercher un étudiant…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-40 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-gray-400 transition-colors"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none cursor-pointer"
          >
            <option value="all">Tous ({students.length})</option>
            <option value="pending">Non saisis ({stats.pending})</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label} ({s === "PRESENT" ? stats.PRESENT : stats.ABSENT})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
              Aucun étudiant trouvé
            </div>
          ) : (
            filtered.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                status={attendance[student.id]}
                onChange={handleChange}
              />
            ))
          )}
        </div>

        <div className="sticky bottom-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isPending || stats.pending > 0}
            className={`px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 cursor-pointer shadow-lg ${
              savedOnce
                ? "bg-green-600 shadow-green-200"
                : stats.pending > 0
                ? "bg-gray-300 shadow-none cursor-not-allowed"
                : isPending
                ? "bg-gray-700 opacity-70 cursor-wait"
                : "bg-gray-900 hover:bg-gray-800 shadow-gray-300"
            }`}
          >
            {isPending
              ? "Enregistrement…"
              : savedOnce
              ? "✓ Présences sauvegardées"
              : stats.pending > 0
              ? `${stats.pending} étudiant(s) restant(s)`
              : "Enregistrer les présences"}
          </button>
        </div>
      </div>
    </div>
  );
}