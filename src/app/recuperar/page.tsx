import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/ForgotForm";
import { PageShell } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false } };

export default function RecuperarPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-md rounded-3xl border border-desk-line bg-desk-2 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold">¿Olvidaste tu contraseña?</h1>
        <p className="mb-6 mt-1 text-sm text-fog">Escribe tu correo y te mandamos un enlace para elegir una nueva.</p>
        <ForgotForm />
      </div>
    </PageShell>
  );
}
