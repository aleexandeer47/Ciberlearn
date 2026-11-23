import { Check } from "lucide-react";
import { Suspense } from "react";
import { PageShell } from "@/components/SiteHeader";
import { getT } from "@/lib/i18n-server";
import { AuthForm } from "./AuthForm";

export async function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const { t } = await getT();
  const isSignup = mode === "signup";
  const PERKS = [
    t("Guarda cada ronda y mira tu evolución", "Save every round and track your progress"),
    t("Sube de nivel y gana insignias", "Level up and earn badges"),
    t("Descubre qué tipo de trampa se te escapa más", "Find out which kind of trap you miss most"),
  ];
  return (
    <PageShell>
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div className="hidden lg:block">
          <p className="eyebrow">{t("Tu expediente", "Your record")}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">
            {isSignup
              ? t("Crea tu cuenta y entrena con memoria", "Create your account and train with memory")
              : t("Bienvenido de vuelta, detective", "Welcome back, detective")}
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
          <h2 className="font-display text-2xl font-semibold">{isSignup ? t("Crear cuenta", "Sign up") : t("Entrar", "Log in")}</h2>
          <p className="mb-6 mt-1 text-sm text-fog">
            {isSignup ? t("Gratis. Sin tarjeta.", "Free. No card needed.") : t("Con tu correo y contraseña.", "With your email and password.")}
          </p>
          <Suspense>
            <AuthForm mode={mode} />
          </Suspense>
        </div>
      </div>
    </PageShell>
  );
}
