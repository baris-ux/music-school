"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/login", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? "Erreur de connexion"); return; }
      if (result.role === "ADMIN") { router.push("/admin/students"); router.refresh(); return; }
      if (result.role === "STUDENT") { router.push("/student"); router.refresh(); return; }
      router.push("/");
      router.refresh();
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          Adresse e-mail
        </label>
        <input
          id="email" name="email" type="email" required
          placeholder="vous@exemple.com"
          className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password" name="password" type={showPassword ? "text" : "password"} required
            placeholder="••••••••"
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            {showPassword
              ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit" disabled={pending}
        className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Connexion en cours…" : "Se connecter"}
      </button>

      <div className="flex items-center gap-3 text-xs text-slate-400 my-1">
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
        ou
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
      </div>

      <p className="text-center text-xs text-slate-400">
        <a href="/forgot-password" className="text-amber-500 hover:text-amber-600 font-medium transition">
          Mot de passe oublié ?
        </a>
      </p>

      <p className="text-center text-xs text-slate-400">
        Pas encore de compte ?{" "}
        <a href="/contact" className="text-amber-500 hover:text-amber-600 font-medium transition">
          Contacter l'école
        </a>
      </p>
    </form>
  );
}