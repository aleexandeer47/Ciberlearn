import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PrintButton } from "@/components/progress/PrintButton";
import { Logo, PageShell } from "@/components/SiteHeader";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { SITE } from "@/lib/site";
import { computeStats } from "@/lib/stats";

export const metadata: Metadata = { title: "Certificado", robots: { index: false } };

async function Certificate() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/certificado");
  if (!user.isPro) redirect("/planes");

  const { runs } = await collections();
  const docs = await runs.find({ userId: user._id }).toArray();
  const stats = computeStats(docs);
  if (stats.bestScore < 70) redirect("/progreso");
  const best = docs.reduce((a, b) => (b.score > a.score ? b : a));
  const code = best._id.toHexString().slice(-8).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <Link href="/progreso" className="text-sm text-fog hover:text-chalk">
          ← Volver a mi progreso
        </Link>
        <PrintButton />
      </div>
      <article className="relative overflow-hidden rounded-3xl bg-paper p-8 text-ink shadow-2xl ring-1 ring-line sm:p-14 print:rounded-none print:shadow-none">
        <div className="pointer-events-none absolute inset-3 rounded-[20px] border-2 border-ink/10 sm:inset-5" />
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-semibold text-lg">{SITE.name}</span>
        </div>
        <p className="mt-12 font-mono text-xs text-ink-3">Certificado de finalización</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">{user.name}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">
          completó el entrenamiento de detección de phishing de {SITE.name}, con {stats.messages} mensajes revisados y un
          mejor puntaje de <strong className="text-ink">{stats.bestScore}/100</strong>, alcanzando el nivel{" "}
          <strong className="text-ink">{stats.level.name}</strong>.
        </p>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
          <dl className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <dt className="text-ink-3">Fecha</dt>
              <dd className="font-semibold">{best.createdAt.toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" })}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Precisión</dt>
              <dd className="font-semibold">{stats.accuracy}%</dd>
            </div>
            <div>
              <dt className="text-ink-3">Código</dt>
              <dd className="font-mono font-semibold">{code}</dd>
            </div>
          </dl>
          <div className="-rotate-6 rounded-xl border-4 border-double border-ok px-4 py-1.5 font-display text-xl font-bold uppercase text-ok">
            Aprobado
          </div>
        </div>
        <p className="mt-12 border-t border-line pt-4 text-xs text-ink-3">
          Certificado interno de finalización. No es una certificación profesional acreditada.
        </p>
      </article>
    </div>
  );
}

export default function CertificadoPage() {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-[70vh] max-w-4xl animate-pulse rounded-3xl bg-desk-2/50" />}>
        <Certificate />
      </Suspense>
    </PageShell>
  );
}
