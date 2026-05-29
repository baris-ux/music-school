"use client";

import { useActionState, useState, useRef, DragEvent } from "react";

type Props = {
  uploadResource: (
    prevState: { error: string | null; success: string | null },
    formData: FormData
  ) => Promise<{ error: string | null; success: string | null }>;
};

export default function UploadForm({ uploadResource }: Props) {
  const [state, formAction, isPending] = useActionState(uploadResource, {
    error: null,
    success: null,
  });

  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInputRef.current.files = dt.files;
      }
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Ajouter une ressource</h2>

      <form ref={formRef} action={formAction} className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Titre *
          </label>
          <input
            name="title"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Fichier PDF *
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
              dragging
                ? "border-slate-500 bg-slate-50"
                : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-800">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <p className="text-xs text-slate-400">
                  Cliquez ou déposez un autre fichier pour remplacer
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700">
                  Glissez-déposez votre PDF ici
                </p>
                <p className="text-xs text-slate-500">
                  ou cliquez pour sélectionner un fichier
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              name="file"
              type="file"
              accept="application/pdf"
              required
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
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
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? "Envoi en cours..." : "Ajouter la ressource"}
        </button>
      </form>
    </div>
  );
}