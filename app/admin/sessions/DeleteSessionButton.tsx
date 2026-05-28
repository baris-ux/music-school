"use client";

import { deleteSession } from "./actions";

type Props = {
  id: string;
};

export default function DeleteSessionButton({ id }: Props) {
  return (
    <form
      action={deleteSession}
      onSubmit={(e) => {
        if (!window.confirm("Supprimer cette séance ? Cette action est irréversible.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
      >
        Supprimer
      </button>
    </form>
  );
}