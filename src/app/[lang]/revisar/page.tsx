import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckerTool } from "@/components/check/CheckerTool";
import { PageShell } from "@/components/SiteHeader";
import { getT } from "@/lib/i18n-server";
import { aiEnabled } from "@/lib/server/ai";
import { getCurrentUser } from "@/lib/server/session";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    alternates: await alternatesFor("/revisar"),
    title: t("¿Es estafa? Cómo reconocer mensajes fraudulentos", "Is it a scam? How to recognize fraudulent messages"),
    description: t(
      "Pega un correo, SMS o mensaje de WhatsApp sospechoso y descubre al instante si es fraudulento y qué señales de estafa tiene. Gratis y sin enviar tus datos.",
      "Paste a suspicious email, text or WhatsApp message and instantly see whether it’s fraudulent and which scam signs it has. Free, and your data stays with you.",
    ),
  };
}

async function Tool() {
  const user = await getCurrentUser();
  return <CheckerTool aiReady={aiEnabled()} isPro={!!user?.isPro} loggedIn={!!user} />;
}

export default async function RevisarPage() {
  const { t } = await getT();
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <span className="eyebrow">{t("Herramienta gratis", "Free tool")}</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{t("¿Es estafa?", "Is it a scam?")}</h1>
        <p className="mb-8 mt-3 text-lg text-fog">
          {t(
            "¿Te llegó algo raro? Pégalo aquí y te decimos qué señales de estafa tiene, cada una explicada.",
            "Got something odd? Paste it here and we'll show you which scam signs it has, each one explained.",
          )}
        </p>
        <Suspense fallback={<div className="h-72 animate-pulse rounded-3xl bg-desk-3" />}>
          <Tool />
        </Suspense>
      </div>
    </PageShell>
  );
}
