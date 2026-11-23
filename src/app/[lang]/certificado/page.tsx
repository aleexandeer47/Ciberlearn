import { randomBytes } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PrintButton } from "@/components/progress/PrintButton";
import { Logo, PageShell } from "@/components/SiteHeader";
import { LOCALE } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";
import { env } from "@/lib/server/env";
import { getCurrentUser } from "@/lib/server/session";
import { SITE } from "@/lib/site";
import { computeStats } from "@/lib/stats";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Certificado", "Certificate"), robots: { index: false } };
}

async function Certificate() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/certificado");
  if (!user.isPro) redirect("/planes");
  const { lang, t } = await getT();
  const fmt = (d: Date) => d.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "long", year: "numeric" });

  const { runs } = await collections();
  const docs = await runs.find({ userId: user._id }).toArray();
  const stats = computeStats(docs, lang);
  if (stats.bestScore < 70) redirect("/progreso");
  const best = docs.reduce((a, b) => (b.score > a.score ? b : a));

  // Código público para verificar el certificado en /verificar/…; se conserva y se actualizan las cifras si mejoran.
  const { users } = await collections();
  const doc = await users.findOne({ _id: user._id }, { projection: { certificate: 1 } });
  const snapshot = { bestScore: stats.bestScore, level: stats.level.name, messages: stats.messages };
  let cert = doc?.certificate;
  if (!cert) {
    cert = { code: randomBytes(5).toString("hex").toUpperCase(), issuedAt: best.createdAt, ...snapshot };
    await users.updateOne({ _id: user._id, certificate: { $exists: false } }, { $set: { certificate: cert } });
    cert = (await users.findOne({ _id: user._id }, { projection: { certificate: 1 } }))?.certificate ?? cert;
  } else if (cert.bestScore < snapshot.bestScore || cert.messages !== snapshot.messages) {
    cert = { ...cert, ...snapshot, issuedAt: best.createdAt };
    await users.updateOne({ _id: user._id }, { $set: { certificate: cert } });
  }
  const code = cert.code;
  const verifyUrl = `${env.appUrl.replace(/^https?:\/\//, "")}/verificar/${code}`;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <Link href="/progreso" className="text-sm text-fog hover:text-chalk">
          {t("← Volver a mi progreso", "← Back to my progress")}
        </Link>
        <PrintButton />
      </div>
      <article className="relative overflow-hidden rounded-3xl bg-paper p-8 text-ink shadow-2xl ring-1 ring-line sm:p-14 print:rounded-none print:shadow-none">
        <div className="pointer-events-none absolute inset-3 rounded-[20px] border-2 border-ink/10 sm:inset-5" />
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-semibold text-lg">{SITE.name}</span>
        </div>
        <p className="mt-12 font-mono text-xs text-ink-3">{t("Certificado de finalización", "Certificate of completion")}</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">{user.name}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">
          {t(
            `completó el entrenamiento de detección de phishing de ${SITE.name}, con ${stats.messages} mensajes revisados y un mejor puntaje de`,
            `completed the ${SITE.name} phishing detection training, reviewing ${stats.messages} messages with a best score of`,
          )}{" "}
          <strong className="text-ink">{stats.bestScore}/100</strong>, {t("alcanzando el nivel", "reaching level")}{" "}
          <strong className="text-ink">{stats.level.name}</strong>.
        </p>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
          <dl className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <dt className="text-ink-3">{t("Fecha", "Date")}</dt>
              <dd className="font-semibold">{fmt(cert.issuedAt)}</dd>
            </div>
            <div>
              <dt className="text-ink-3">{t("Precisión", "Accuracy")}</dt>
              <dd className="font-semibold">{stats.accuracy}%</dd>
            </div>
            <div>
              <dt className="text-ink-3">{t("Código", "Code")}</dt>
              <dd className="font-mono font-semibold">{code}</dd>
            </div>
          </dl>
          <div className="-rotate-6 rounded-xl border-4 border-double border-ok px-4 py-1.5 font-display text-xl font-bold uppercase text-ok">
            {t("Aprobado", "Passed")}
          </div>
        </div>
        <p className="mt-12 border-t border-line pt-4 text-xs text-ink-3">
          {t(
            "Certificado interno de finalización. No es una certificación profesional acreditada. Verifícalo en",
            "Internal certificate of completion. It is not an accredited professional certification. Verify it at",
          )}{" "}
          <span className="font-mono">{verifyUrl}</span>
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
