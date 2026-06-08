"use client";

import { useState } from "react";

interface Props {
  eventId: string;
  remaining: number;
}

export default function GeneratePaperTicketsButton({ eventId, remaining }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (quantity < 1 || quantity > remaining) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/events/${eventId}/paper-tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur inconnue");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "billets-papier.pdf";
      a.click();
      URL.revokeObjectURL(url);

      window.location.reload();
    } catch {
      setError("Erreur lors de la génération");
    } finally {
      setLoading(false);
    }
  }

  if (remaining <= 0) {
    return <p className="text-xs text-red-600 font-medium">Événement complet — aucun billet disponible</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="number"
          min={1}
          max={remaining}
          value={quantity}
          onChange={(e) => setQuantity(Math.min(remaining, Math.max(1, Number(e.target.value))))}
          className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-950 outline-none focus:border-slate-500"
        />
        <span className="text-xs text-slate-500">billets (max {remaining})</span>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || quantity < 1 || quantity > remaining}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Génération en cours…" : "Générer et télécharger PDF"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
