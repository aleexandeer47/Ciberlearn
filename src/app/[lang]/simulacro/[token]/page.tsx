import { AlertTriangle, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SimBeacon } from "@/components/business/SimBeacon";
import { PageShell } from "@/components/SiteHeader";
import { phishTemplate } from "@/lib/business";
import { getT } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";
import { sha256 } from "@/lib/server/org";
import { SITE } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Era un simulacro", "It was a drill"), robots: { index: false, follow: false } };
}

async function Lesson({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  const { lang, t } = await getT();
  if (token.length < 20 || token.length > 64) notFound();
  const { phishTargets, phishCampaigns, orgs } = await collections();
  const target = await phishTargets.findOne({ tokenHash: sha256(token) }, { projection: { campaignId: 1, orgId: 1 } });
  if (!target) notFound();
  const [campaign, org] = await Promise.all([
    phishCampaigns.findOne({ _id: target.campaignId }, { projection: { templateId: 1, lang: 1 } }),
    orgs.findOne({ _id: target.orgId }, { projection: { name: 1 } }),
  ]);
  // El asunto, tal como llegó (idioma de la campaña); las explicaciones, en el idioma de la página
  const sent = campaign ? phishTemplate(campaign.templateId, campaign.lang ?? "es") : undefined;
  const tpl = campaign ? phishTemplate(campaign.templateId, lang) : undefined;
  if (!sent || !tpl || !org) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <SimBeacon token={token} />
      <div className="rounded-3xl bg-bad-soft p-7 text-ink">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-bad text-white">
          <AlertTriangle className="h-6 w-6" strokeWidth={2} aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-3xl">{t("Tranquilo: era un simulacro", "Don't worry: it was a drill")}</h1>
        <p className="mt-2 leading-relaxed">
          {t(
            `Este correo (“${sent.subject(org.name)}”) fue una práctica de ${org.name} con ${SITE.name}. No se robó ningún dato. Si hubiera sido real, al hacer clic podrías haber entregado tu contraseña o instalado algo dañino.`,
            `This email (“${sent.subject(org.name)}”) was a practice drill by ${org.name} using ${SITE.name}. No data was stolen. If it had been real, clicking could have given away your password or installed something harmful.`,
          )}
        </p>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-2xl">{t("Lo que debiste notar", "What you should have noticed")}</h2>
        <ul className="mt-4 space-y-3">
          {tpl.signals.map((s) => (
            <li key={s} className="flex gap-3 rounded-2xl border border-desk-line bg-desk-2 p-4">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-ok" strokeWidth={2.5} aria-hidden />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-3xl bg-field p-6">
        <h2 className="font-semibold">{t("La próxima vez", "Next time")}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-graphite">
          <li>{t("Revisa la dirección del remitente, no solo el nombre que aparece.", "Check the sender's address, not just the name shown.")}</li>
          <li>
            {t(
              "Si un correo te apura o te pide entrar a una cuenta, entra tú por la vía de siempre, no por el enlace.",
              "If an email rushes you or asks you to sign in, go in the usual way yourself, not through the link.",
            )}
          </li>
          <li>
            {t(
              "Ante la duda, pregunta por otro canal a quien supuestamente lo envió, o repórtalo a tu encargado.",
              "When in doubt, ask the supposed sender through another channel, or report it to your manager.",
            )}
          </li>
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/ruta" className="btn btn-primary px-6 py-3.5">
          {t("Practicar en la ruta", "Practice on the path")}
        </Link>
        <Link href="/simulador" className="btn btn-ghost px-6 py-3.5">
          {t("Ir al simulador", "Go to the simulator")}
        </Link>
      </div>
      <p className="mt-6 text-xs text-fog">
        {t(
          "Tu encargado verá que abriste este enlace, como autorizaste al unirte a tu empresa. Nadie verá lo que escribas: aquí no se pide ningún dato.",
          "Your manager will see that you opened this link, as you agreed when you joined your company. Nobody will see anything you type: no data is requested here.",
        )}
      </p>
    </div>
  );
}

export default function SimulacroPage(props: PageProps<"/[lang]/simulacro/[token]">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-96 max-w-2xl animate-pulse rounded-3xl bg-desk-3" />}>
        <Lesson params={props.params} />
      </Suspense>
    </PageShell>
  );
}
