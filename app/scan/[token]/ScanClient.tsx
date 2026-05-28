"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Result = "idle" | "valid" | "invalid" | "already_used" | "loading";

const MESSAGES: Record<Result, string> = {
  idle: "Pointez la caméra vers un billet",
  loading: "Vérification...",
  valid: "✅ Billet valide — Entrée autorisée",
  invalid: "❌ Billet invalide",
  already_used: "⚠️ Billet déjà utilisé",
};

const COLORS: Record<Result, string> = {
  idle: "border-slate-600 bg-slate-800",
  loading: "border-slate-500 bg-slate-800",
  valid: "border-green-500 bg-green-900",
  invalid: "border-red-500 bg-red-900",
  already_used: "border-yellow-500 bg-yellow-900",
};

export default function ScanClient({ scanToken }: { scanToken: string }) {
  const [result, setResult] = useState<Result>("idle");
  const [info, setInfo] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: "environment" }, // caméra arrière
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        if (!isProcessing.current) {
          handleScan(decodedText);
        }
      },
      () => {} // erreurs de lecture ignorées (normal pendant le scan)
    );

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  async function handleScan(qrCode: string) {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setResult("loading");
    setInfo(null);

    try {
      const res = await fetch(
        `/api/ticket/validate/${encodeURIComponent(qrCode)}?scanToken=${encodeURIComponent(scanToken)}`
      );
      const data = await res.json();

      if (data.status === "VALID") {
        setResult("valid");
        if (data.ticket?.order?.email) setInfo(data.ticket.order.email);
      } else if (data.status === "ALREADY_USED") {
        setResult("already_used");
        if (data.ticket?.usedAt) {
          const usedAt = new Date(data.ticket.usedAt).toLocaleString("fr-BE", {
            dateStyle: "short",
            timeStyle: "short",
          });
          setInfo(`Utilisé le ${usedAt}`);
        }
      } else {
        setResult("invalid");
      }
    } catch {
      setResult("invalid");
    }

    setTimeout(() => {
      setResult("idle");
      setInfo(null);
      isProcessing.current = false;
    }, 3000);
  }

  return (
    <div className="space-y-4">
      {/* Viewfinder caméra */}
      <div className="overflow-hidden rounded-2xl border-2 border-slate-600">
        <div id="qr-reader" className="w-full" />
      </div>

      {/* Résultat */}
      <div className={`rounded-2xl border-2 p-6 text-center transition-all duration-300 ${COLORS[result]}`}>
        <p className="text-xl font-bold text-white">{MESSAGES[result]}</p>
        {info && <p className="mt-1 text-sm text-slate-300">{info}</p>}
      </div>
    </div>
  );
}