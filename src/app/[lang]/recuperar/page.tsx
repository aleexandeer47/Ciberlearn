import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/ForgotForm";
import { PageShell } from "@/components/SiteHeader";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Recuperar contraseña", "Reset password"), robots: { index: false } };
}

export default async function RecuperarPage() {
  const { t } = await getT();
  return (
    <PageShell>
      <div className="mx-auto max-w-md rounded-3xl border border-desk-line bg-desk-2 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold">{t("¿Olvidaste tu contraseña?", "Forgot your password?")}</h1>
        <p className="mb-6 mt-1 text-sm text-fog">
          {t("Escribe tu correo y te mandamos un enlace para elegir una nueva.", "Enter your email and we'll send you a link to choose a new one.")}
        </p>
        <ForgotForm />
      </div>
    </PageShell>
  );
}
