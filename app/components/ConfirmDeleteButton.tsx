"use client";

import { useState } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
  id: string;
  title: string;
  message: string;
  label?: string;
  className?: string;
};

export default function ConfirmDeleteButton({
  action,
  id,
  title,
  message,
  label = "Supprimer",
  className = "rounded-lg px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 hover:text-red-800",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            {/* Icône */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h3 className="text-center text-base font-semibold text-slate-950">{title}</h3>
            <p className="mt-2 text-center text-sm text-slate-600">{message}</p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Annuler
              </button>

              <form action={action} className="flex-1">
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Supprimer
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
