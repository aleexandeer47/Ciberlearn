import { AlertTriangle, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SimBeacon } from "@/components/business/SimBeacon";
import { PageShell } from "@/components/SiteHeader";
import { PHISH_BY_ID } from "@/lib/business";
import { collections } from "@/lib/server/db";
import { sha256 } from "@/lib/server/org";

export const metadata: Metadata = { title: "Era un simulacro", robots: { index: false, follow: false } };

async function Lesson({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  if (token.length < 20 || token.length > 64) notFound();
  const { phishTargets, phishCampaigns, orgs } = await collections();
  const target = await phishTargets.findOne({ tokenHash: sha256(token) }, { projection: { campaignId: 1, orgId: 1 } });
  if (!target) notFound();
  const [campaign, org] = await Promise.all([
    phishCampaigns.findOne({ _id: target.campaignId }, { projection: { templateId: 1 } }),
    orgs.findOne({ _id: target.orgId }, { projection: { name: 1 } }),
  ]);
  const t = campaign ? PHISH_BY_ID.get(campaign.templateId) : undefined;
  if (!t || !org) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <SimBeacon token={token} />
      <div className="rounded-3xl bg-bad-soft p-7 text-ink">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-bad text-white">
          <AlertTriangle className="h-6 w-6" strokeWidth={2} aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-3xl">Tranquilo: era un simulacro</h1>
        <p className="mt-2 leading-relaxed">
          Este correo (“{t.subject(org.name)}”) fue una práctica de {org.name} con Ciberlearn. No se robó ningún dato. Si
          hubiera sido real, al hacer clic podrías haber entregado tu contraseña o instalado algo dañino.
        </p>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-2xl">Lo que debiste notar</h2>
        <ul className="mt-4 space-y-3">
          {t.signals.map((s) => (
            <li key={s} className="flex gap-3 rounded-2xl border border-desk-line bg-desk-2 p-4">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-ok" strokeWidth={2.5} aria-hidden />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-3xl bg-field p-6">
        <h2 className="font-semibold">La próxima vez</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-graphite">
          <li>Revisa la dirección del remitente, no solo el nombre que aparece.</li>
          <li>Si un correo te apura o te pide entrar a una cuenta, entra tú por la vía de siempre, no por el enlace.</li>
          <li>Ante la duda, pregunta por otro canal a quien supuestamente lo envió, o repórtalo a tu encargado.</li>
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/ruta" className="btn btn-primary px-6 py-3.5">
          Practicar en la ruta
        </Link>
        <Link href="/simulador" className="btn btn-ghost px-6 py-3.5">
          Ir al simulador
        </Link>
      </div>
      <p className="mt-6 text-xs text-fog">
        Tu encargado verá que abriste este enlace, como autorizaste al unirte a tu empresa. Nadie verá lo que escribas: aquí
        no se pide ningún dato.
      </p>
    </div>
  );
}

export default function SimulacroPage(props: PageProps<"/simulacro/[token]">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-96 max-w-2xl animate-pulse rounded-3xl bg-desk-3" />}>
        <Lesson params={props.params} />
      </Suspense>
    </PageShell>
  );
}
