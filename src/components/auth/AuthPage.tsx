import { Check } from "lucide-react";
import { Suspense } from "react";
import { PageShell } from "@/components/SiteHeader";
import { AuthForm } from "./AuthForm";

const PERKS = [
  "Guarda cada ronda y mira tu evolución",
  "Sube de nivel y gana insignias",
  "Descubre qué tipo de trampa se te escapa más",
];

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  return (
    <PageShell>
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div className="hidden lg:block">
          <p className="eyebrow">Tu expediente</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">
            {isSignup ? "Crea tu cuenta y entrena con memoria" : "Bienvenido de vuelta, detective"}
          </h1>
          <ul className="mt-8 space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-fog">
                <Check className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-desk-line bg-desk-2 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold">{isSignup ? "Crear cuenta" : "Entrar"}</h2>
          <p className="mb-6 mt-1 text-sm text-fog">
            {isSignup ? "Gratis. Sin tarjeta." : "Con tu correo y contraseña."}
          </p>
          <Suspense>
            <AuthForm mode={mode} />
          </Suspense>
        </div>
      </div>
    </PageShell>
  );
}
