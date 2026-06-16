import Navbar from "../components/Navbar";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-950">Connexion</h1>
            <p className="mt-1 text-sm text-slate-700">Accédez à votre espace membre.</p>
          </div>
          <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
            <LoginForm />
          </div>
        </div>
      </main>
    </>
  );
}