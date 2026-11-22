import { Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { InboxTrainer } from "@/components/inbox/InboxTrainer";
import { PageShell } from "@/components/SiteHeader";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Bandeja de entrenamiento",
  description: "Un correo simulado con mensajes reales y trampas: reporta, elimina o confía, como en tu trabajo.",
};

async function Trainer() {
  const user = await getCurrentUser();
  if (!user)
    return (
      <Gate title="Entra para usar la bandeja" cta={{ href: "/registro?next=/bandeja", label: "Crear cuenta gratis" }}>
        La bandeja de entrenamiento es parte del plan Pro.
      </Gate>
    );
  if (!user.isPro)
    return (
      <Gate title="Exclusivo del plan Pro" cta={{ href: "/planes", label: "Ver plan Pro" }}>
        Practica con un correo simulado: 8 mensajes por bandeja, mezcla de reales y trampas, y una calificación detallada.
      </Gate>
    );

  const { inboxResults } = await collections();
  const history = await inboxResults.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).toArray();
  return (
    <div className="space-y-8">
      <InboxTrainer />
      {history.length > 0 && (
        <section>
          <h2 className="font-display text-xl">Tus últimas bandejas</h2>
          <ul className="mt-3 divide-y divide-desk-line rounded-2xl border border-desk-line bg-desk-2 text-sm">
            {history.map((h) => (
              <li key={h._id.toHexString()} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <span className="text-fog">{h.createdAt.toLocaleDateString("es-SV", { day: "numeric", month: "short" })}</span>
                <span>
                  <strong className="tabular-nums">{h.score}</strong>/100 · reportaste {h.reported} de {h.phishing} · {h.clicked} clics
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Gate({ title, cta, children }: { title: string; cta: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-desk-line bg-desk-2 p-8 text-center">
      <Lock className="mx-auto h-8 w-8 text-fog" aria-hidden />
      <h2 className="mt-3 font-display text-2xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-fog">{children}</p>
      <Link href={cta.href} className="btn btn-primary mt-6 h-12 px-6">
        {cta.label}
      </Link>
    </div>
  );
}

export default function BandejaPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px]">
        <span className="eyebrow">Entrenamiento · Pro</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Bandeja de entrenamiento</h1>
        <p className="mb-8 mt-3 max-w-2xl text-lg text-fog">
          Así se ve un día normal de correo. Decide qué haces con cada mensaje: lo ideal es reportar las trampas, no solo
          borrarlas.
        </p>
        <Suspense fallback={<div className="h-[560px] animate-pulse rounded-3xl bg-desk-3" />}>
          <Trainer />
        </Suspense>
      </div>
    </PageShell>
  );
}
