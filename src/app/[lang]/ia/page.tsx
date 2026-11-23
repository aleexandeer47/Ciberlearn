import type { Metadata } from "next";
import { Suspense } from "react";
import { chatAccess } from "@/app/actions/ai";
import { ChatArena } from "@/components/ai/ChatArena";
import { PageShell } from "@/components/SiteHeader";
import { personasFor } from "@/lib/ai/personas";
import { getT } from "@/lib/i18n-server";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    alternates: await alternatesFor("/ia"),
    title: t("Chats con IA", "AI chats"),
    description: t(
      "Una IA intenta estafarte en un chat. Practica a no caer, sin riesgo. Exclusivo de Pro.",
      "An AI tries to scam you in a chat. Practice not falling for it, risk-free. Pro only.",
    ),
  };
}

async function Arena() {
  const [access, { lang }] = await Promise.all([chatAccess(), getT()]);
  // Solo los datos públicos de cada escenario (sin el objetivo oculto del estafador)
  const personas = personasFor(lang).map(({ id, title, description, from, channel }) => ({ id, title, description, from, channel }));
  return <ChatArena personas={personas} {...access} />;
}

export default async function IaPage() {
  const { t } = await getT();
  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px]">
        <span className="eyebrow">{t("Práctica con IA · Pro", "AI practice · Pro")}</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{t("¿Caerías en un chat real?", "Would you fall for a real chat?")}</h1>
        <p className="mt-3 max-w-2xl text-lg text-fog">
          {t(
            "Una IA se hace pasar por un estafador y conversa contigo. Si no entregas nada y cortas la estafa, ganas XP.",
            "An AI poses as a scammer and chats with you. If you hand over nothing and shut the scam down, you earn XP.",
          )}
        </p>
        <div className="mt-10">
          <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-desk-3" />}>
            <Arena />
          </Suspense>
        </div>
      </div>
    </PageShell>
  );
}
