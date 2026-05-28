"use client";

import Calendar from "react-calendar";
import { useState } from "react";

type UpcomingSession = {
  id: string;
  startsAt: string;
  endsAt: string;
  course: { title: string };
};

export default function SessionCalendar({ sessions }: { sessions: UpcomingSession[] }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const sessionDates = new Set(
    sessions.map((s) => new Date(s.startsAt).toDateString())
  );

  const sessionsForSelected = sessions.filter(
    (s) => new Date(s.startsAt).toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="space-y-4">
      <Calendar
        onChange={(value) => setSelectedDate(value as Date)}
        value={selectedDate}
        locale="fr-BE"
        tileContent={({ date }) =>
          sessionDates.has(date.toDateString()) ? (
            <div className="mx-auto mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
          ) : null
        }
      />

      <div className="min-h-[60px]">
        {sessionsForSelected.length > 0 ? (
          <div className="space-y-2">
            {sessionsForSelected.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3"
              >
                <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {session.course.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(session.startsAt).toLocaleTimeString("fr-BE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    —{" "}
                    {new Date(session.endsAt).toLocaleTimeString("fr-BE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-2">
            Aucune séance ce jour.
          </p>
        )}
      </div>
    </div>
  );
}
