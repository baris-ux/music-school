"use client";

import { updateSessionStatus } from "./actions";

type Status = "PLANNED" | "CANCELLED" | "COMPLETED";

type Props = {
  id: string;
  currentStatus: Status;
};

const LABELS: Record<Status, string> = {
  PLANNED: "Planifiée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};

const STYLES: Record<Status, string> = {
  PLANNED: "bg-blue-50 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
};

export default function SessionStatusButton({ id, currentStatus }: Props) {
  return (
    <div className="flex items-center gap-1">
      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STYLES[currentStatus]}`}>
        {LABELS[currentStatus]}
      </span>

      {currentStatus === "PLANNED" && (
        <>
          <form action={updateSessionStatus}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="COMPLETED" />
            <button
              type="submit"
              className="rounded-lg border border-green-200 px-2 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50"
            >
              Terminer
            </button>
          </form>
          <form
            action={updateSessionStatus}
            onSubmit={(e) => {
              if (!window.confirm("Annuler cette séance ?")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="CANCELLED" />
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
            >
              Annuler
            </button>
          </form>
        </>
      )}

      {(currentStatus === "CANCELLED" || currentStatus === "COMPLETED") && (
        <form action={updateSessionStatus}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="PLANNED" />
          <button
            type="submit"
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Réactiver
          </button>
        </form>
      )}
    </div>
  );
}
