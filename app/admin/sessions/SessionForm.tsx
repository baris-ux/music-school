"use client";

import { useActionState, useState } from "react";
import { createSession } from "./actions";

type Course = {
  id: string;
  title: string;
};

type Props = {
  courses: Course[];
};

const initialState: { error?: string; success?: string } = {};

const MONTHS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];
const MONTHS_FR = [
  "janvier","février","mars","avril","mai","juin",
  "juillet","août","septembre","octobre","novembre","décembre",
];
const DAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

function CalendarPicker({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}) {
  const today = new Date();

  const parseView = (dateStr: string | null) => {
    if (dateStr) {
      const [y, m] = dateStr.split("-").map(Number);
      return { year: y, month: m - 1 };
    }
    return { year: today.getFullYear(), month: today.getMonth() };
  };

  const initial = parseView(selectedDate);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const totalCells = startOffset + daysInMonth;
  const trailingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  const dateKey = (d: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <div className="flex gap-1">
          <button type="button" onClick={prevMonth} className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-slate-200">‹</button>
          <button type="button" onClick={nextMonth} className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-slate-200">›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="py-1 text-center text-xs font-medium text-slate-400">{d}</div>
        ))}

        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`prev-${i}`} className="py-1.5 text-center text-xs text-slate-300">
            {prevMonthDays - startOffset + 1 + i}
          </div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = dateKey(day);
          const isToday =
            today.getFullYear() === viewYear &&
            today.getMonth() === viewMonth &&
            today.getDate() === day;
          const isSelected = selectedDate === key;
          const isPast =
            new Date(viewYear, viewMonth, day) <
            new Date(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <button
              key={key}
              type="button"
              disabled={isPast}
              onClick={() => onSelectDate(key)}
              className={`rounded-lg py-1.5 text-xs transition
                ${isSelected
                  ? "bg-slate-900 font-semibold text-white"
                  : isToday
                  ? "font-semibold text-slate-900 ring-1 ring-slate-400"
                  : isPast
                  ? "cursor-not-allowed text-slate-300"
                  : "text-slate-700 hover:bg-slate-200"
                }`}
            >
              {day}
            </button>
          );
        })}

        {Array.from({ length: trailingCells }).map((_, i) => (
          <div key={`next-${i}`} className="py-1.5 text-center text-xs text-slate-300">{i + 1}</div>
        ))}
      </div>
    </div>
  );
}

function formatDateFr(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${parseInt(d)} ${MONTHS_FR[parseInt(m) - 1]} ${y}`;
}

function calcDuration(start: string, end: string): string | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) return null;
  const h = Math.floor(diff / 60);
  const mn = diff % 60;
  return mn === 0 ? `${h}h` : `${h}h${String(mn).padStart(2, "0")}`;
}

export default function SessionForm({ courses }: Props) {
  const [state, formAction, pending] = useActionState(createSession, initialState);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const duration = calcDuration(startTime, endTime);

  const today = new Date().toISOString().slice(0, 10);

  // Synchronise le calendrier et l'input date
  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) setSelectedDate(val);
    else setSelectedDate(null);
  };

  const handleCalendarSelect = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Programmer une séance</h2>
        <p className="mt-1 text-sm text-slate-600">
          Choisissez un cours, une date, une heure de début et une heure de fin.
        </p>
      </div>

      {/* Cours */}
      <div>
        <label htmlFor="courseId" className="mb-1 block text-sm font-medium text-slate-700">
          Cours
        </label>
        <select
          id="courseId"
          name="courseId"
          required
          defaultValue=""
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
        >
          <option value="" disabled>Sélectionner un cours</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
      </div>

      {/* Date : input + calendrier synchronisés */}
      <div>
        <label htmlFor="dateInput" className="mb-1 block text-sm font-medium text-slate-700">
          Date
        </label>

        {/* Input date visible + hidden pour le form */}
        <input type="hidden" name="date" value={selectedDate ?? ""} />
        <input
          id="dateInput"
          type="date"
          min={today}
          value={selectedDate ?? ""}
          onChange={handleDateInput}
          className="mb-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />

        <CalendarPicker
          selectedDate={selectedDate}
          onSelectDate={handleCalendarSelect}
        />

        {selectedDate && (
          <p className="mt-2 text-xs text-slate-500">
            Sélectionné :{" "}
            <span className="font-medium text-slate-800">{formatDateFr(selectedDate)}</span>
          </p>
        )}
      </div>

      {/* Horaires */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="startTime" className="mb-1 block text-sm font-medium text-slate-700">
            Heure de début
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            required
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label htmlFor="endTime" className="mb-1 block text-sm font-medium text-slate-700">
            Heure de fin
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            required
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
          />
        </div>
      </div>

      {/* Durée calculée */}
      {duration && (
        <p className="text-xs text-slate-500">
          Durée : <span className="font-medium text-slate-800">{duration}</span>
        </p>
      )}
      {startTime && endTime && !duration && (
        <p className="text-xs text-red-600">
          L'heure de fin doit être après l'heure de début.
        </p>
      )}

      {/* Messages serveur */}
      {state?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !selectedDate}
        className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Création..." : "Créer la séance"}
      </button>
    </form>
  );
}