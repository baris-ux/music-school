"use client";

import { useActionState, useState } from "react";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
};

type Access = {
  id: string;
  studentId: string;
  student: Student;
};

type Resource = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  accesses: Access[];
};

type Props = {
  resource: Resource;
  students: Student[];
  updateAccess: (
    prevState: { error: string | null; success: string | null },
    formData: FormData
  ) => Promise<{ error: string | null; success: string | null }>;
  deleteResource: (formData: FormData) => Promise<void>;
};

export default function ResourceCard({
  resource,
  students,
  updateAccess,
  deleteResource,
}: Props) {
  const [open, setOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [state, formAction, isPending] = useActionState(updateAccess, {
    error: null,
    success: null,
  });

  const accessStudentIds = resource.accesses.map((a) => a.studentId);

  const filteredStudents = students.filter((s) =>
    `${s.firstName} ${s.lastName}`
      .toLowerCase()
      .includes(studentSearch.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">📄</span>
            <p className="font-semibold text-slate-950 truncate">{resource.title}</p>
          </div>
          {resource.description && (
            <p className="mt-0.5 text-sm text-slate-500 truncate">{resource.description}</p>
          )}
          <p className="mt-0.5 text-xs text-slate-400">{resource.fileName}</p>

          <div className="mt-2 flex flex-wrap gap-1">
            {resource.accesses.length === 0 ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-400">
                Aucun accès
              </span>
            ) : (
              <>
                {resource.accesses.slice(0, 3).map((access) => (
                  <span
                    key={access.id}
                    className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700"
                  >
                    {access.student.firstName} {access.student.lastName}
                  </span>
                ))}
                {resource.accesses.length > 3 && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                    +{resource.accesses.length - 3} autres
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => window.open(`/api/resources/${resource.id}`, "_blank")}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Voir
          </button>
          <button
            onClick={() => setOpen(!open)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              open
                ? "bg-blue-50 text-blue-700"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            {open ? "Fermer" : "Accès"}
          </button>
          <form action={deleteResource}>
            <input type="hidden" name="id" value={resource.id} />
            <input type="hidden" name="fileUrl" value={resource.fileUrl} />
            <button
              type="submit"
              onClick={(e) => {
                if (!confirm(`Supprimer "${resource.title}" ?`)) e.preventDefault();
              }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Supprimer
            </button>
          </form>
        </div>
      </div>

      {open && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="mb-3 text-sm font-medium text-slate-700">
            Accès des élèves ({accessStudentIds.length}/{students.length})
          </p>

          <input
            type="text"
            placeholder="Rechercher un élève..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />

          <form action={formAction} className="space-y-3">
            <input type="hidden" name="resourceId" value={resource.id} />
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2">
              {filteredStudents.length === 0 ? (
                <p className="py-2 text-center text-sm text-slate-400">Aucun élève trouvé</p>
              ) : (
                filteredStudents.map((student) => (
                  <label
                    key={student.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-white transition"
                  >
                    <input
                      type="checkbox"
                      name="studentIds"
                      value={student.id}
                      defaultChecked={accessStudentIds.includes(student.id)}
                      className="rounded"
                    />
                    {student.firstName} {student.lastName}
                  </label>
                ))
              )}
            </div>

            {state.error && (
              <p className="text-sm text-red-600">{state.error}</p>
            )}
            {state.success && (
              <p className="text-sm text-green-600">{state.success}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {isPending ? "Enregistrement..." : "Enregistrer les accès"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}