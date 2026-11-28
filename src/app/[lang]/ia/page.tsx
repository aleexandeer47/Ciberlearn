import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { chatAccess } from "@/app/actions/ai";
import { ChatArena } from "@/components/ai/ChatArena";
import { PageShell } from "@/components/SiteHeader";
import { AI_LAUNCHED, personasFor } from "@/lib/ai/personas";
import { getT } from "@/lib/i18n-server";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    alternates: await alternatesFor("/ia"),
    title: t("Chats con IA", "AI chats"),
    description: t(
      "Próximamente: una IA intenta estafarte en un chat para que practiques a no caer, sin riesgo. Exclusivo de Pro.",
      "Coming soon: an AI tries to scam you in a chat so you can practice not falling for it, risk-free. Pro only.",
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
        {!AI_LAUNCHED && (
          <div role="status" className="mt-6 flex max-w-2xl items-start gap-3 rounded-2xl border border-brand/40 bg-brand/10 px-4 py-3.5">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={2} aria-hidden />
            <p className="text-sm">
              <strong>{t("Próximamente.", "Coming soon.")}</strong>{" "}
              {t(
                "Estamos terminando los chats con IA. Mira los escenarios que vas a poder practicar; te avisaremos cuando estén listos.",
                "We're finishing the AI chats. Take a look at the scenarios you'll be able to practice; we'll let you know when they're ready.",
              )}
            </p>
          </div>
        )}
        <div className="mt-10">
          <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-desk-3" />}>
            <Arena />
          </Suspense>
        </div>
      </div>
    </PageShell>
  );
}
