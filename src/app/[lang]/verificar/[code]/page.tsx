import { BadgeCheck, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageShell } from "@/components/SiteHeader";
import { LOCALE } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";
import { SITE } from "@/lib/site";
import { LEVELS } from "@/lib/stats";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Verificar certificado", "Verify certificate"), robots: { index: false } };
}

async function Verify({ params }: { params: Promise<{ code: string }> }) {
  await connection();
  const { code } = await params;
  const { lang, t } = await getT();
  const clean = decodeURIComponent(code).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
  const { users } = await collections();
  const u = clean.length >= 8 ? await users.findOne({ "certificate.code": clean }, { projection: { name: 1, certificate: 1 } }) : null;

  if (!u?.certificate)
    return (
      <div className="rounded-3xl border border-desk-line bg-desk-2 p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-bad" strokeWidth={1.75} aria-hidden />
        <h1 className="mt-4 font-display text-3xl">{t("Certificado no encontrado", "Certificate not found")}</h1>
        <p className="mt-2 text-fog">
          {t(
            `El código ${clean || "(vacío)"} no corresponde a ningún certificado de ${SITE.name}.`,
            `The code ${clean || "(empty)"} doesn't match any ${SITE.name} certificate.`,
          )}
        </p>
      </div>
    );

  const c = u.certificate;
  // El nivel se guardó con el nombre del idioma de quien lo emitió: se muestra en el idioma de quien lo verifica.
  const level = LEVELS.find((l) => l.name.es === c.level || l.name.en === c.level)?.name[lang] ?? c.level;
  return (
    <div className="rounded-3xl border border-desk-line bg-desk-2 p-8 text-center">
      <BadgeCheck className="mx-auto h-12 w-12 text-ok" strokeWidth={1.75} aria-hidden />
      <p className="eyebrow mt-4">{t("Certificado válido", "Valid certificate")}</p>
      <h1 className="mt-2 font-display text-3xl">{u.name}</h1>
      <p className="mt-3 text-graphite">
        {t(`completó el entrenamiento de detección de phishing de ${SITE.name} con un mejor puntaje de`, `completed the ${SITE.name} phishing detection training with a best score of`)}{" "}
        <strong className="text-chalk">{c.bestScore}/100</strong>, {t("nivel", "level")} <strong className="text-chalk">{level}</strong>,{" "}
        {t(`tras revisar ${c.messages} mensajes.`, `after reviewing ${c.messages} messages.`)}
      </p>
      <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-desk-3 p-3">
          <dt className="text-fog">{t("Emitido", "Issued")}</dt>
          <dd className="font-semibold">{c.issuedAt.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "long", year: "numeric" })}</dd>
        </div>
        <div className="rounded-2xl bg-desk-3 p-3">
          <dt className="text-fog">{t("Código", "Code")}</dt>
          <dd className="font-mono font-semibold">{c.code}</dd>
        </div>
      </dl>
      <p className="mt-6 text-xs text-fog">
        {t(
          "Certificado interno de finalización. No es una certificación profesional acreditada.",
          "Internal certificate of completion. It is not an accredited professional certification.",
        )}
      </p>
    </div>
  );
}

export default function VerificarPage(props: PageProps<"/[lang]/verificar/[code]">) {
  return (
    <PageShell>
      <div className="mx-auto max-w-lg">
        <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-desk-3" />}>
          <Verify params={props.params} />
        </Suspense>
      </div>
    </PageShell>
  );
}
