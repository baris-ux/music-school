"use client";

import { deleteStudent } from "./actions";

export default function DeleteStudentButton({ id }: { id: string }) {
  return (
    <form
      action={deleteStudent}
      onSubmit={(e) => {
        if (!window.confirm("Supprimer cet étudiant ? Toutes ses données seront effacées définitivement.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 hover:text-red-800"
      >
        Supprimer
      </button>
    </form>
  );
}
