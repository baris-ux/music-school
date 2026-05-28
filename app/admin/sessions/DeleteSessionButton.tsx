"use client";

import ConfirmDeleteButton from "@/app/components/ConfirmDeleteButton";
import { deleteSession } from "./actions";

export default function DeleteSessionButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      action={deleteSession}
      id={id}
      title="Supprimer la séance"
      message="Cette séance sera supprimée définitivement. Cette action est irréversible."
      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
    />
  );
}
