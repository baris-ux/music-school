"use client";

import { useState, useMemo } from "react";
import ResourceCard from "./ResourceCard";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
};

type Resource = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  accesses: { id: string; studentId: string; student: Student }[];
};

type Props = {
  resources: Resource[];
  students: Student[];
  updateAccess: (prevState: { error: string | null; success: string | null }, formData: FormData) => Promise<{ error: string | null; success: string | null }>;
  deleteResource: (formData: FormData) => Promise<void>;
};

const PAGE_SIZE = 10;

export default function ResourcesList({ resources, students, updateAccess, deleteResource }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "with_access" | "no_access">("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.fileName.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all"
          ? true
          : filter === "with_access"
          ? r.accesses.length > 0
          : r.accesses.length === 0;
      return matchSearch && matchFilter;
    });
  }, [resources, search, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleFilter(value: typeof filter) {
    setFilter(value);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-950">
          Ressources disponibles{" "}
          <span className="text-sm font-normal text-slate-500">({filtered.length})</span>
        </h2>
      </div>

      {/* Recherche + filtres */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Rechercher par titre ou fichier..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 min-w-48 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
        />
        <div className="flex gap-2">
          {(["all", "with_access", "no_access"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                filter === f
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f === "all" ? "Toutes" : f === "with_access" ? "Avec accès" : "Sans accès"}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {paginated.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune ressource trouvée.</p>
      ) : (
        <div className="space-y-3">
          {paginated.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              students={students}
              updateAccess={updateAccess}
              deleteResource={deleteResource}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            ← Précédent
          </button>
          <span className="text-sm text-slate-500">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}