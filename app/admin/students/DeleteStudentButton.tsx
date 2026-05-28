"use client";

import ConfirmDeleteButton from "@/app/components/ConfirmDeleteButton";
import { deleteStudent } from "./actions";

export default function DeleteStudentButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      action={deleteStudent}
      id={id}
      title="Supprimer l'étudiant"
      message="Toutes les données de cet étudiant seront effacées définitivement. Cette action est irréversible."
    />
  );
}
