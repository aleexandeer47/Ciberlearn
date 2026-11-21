import type { Metadata } from "next";
import { Suspense } from "react";
import { chatAccess } from "@/app/actions/ai";
import { ChatArena } from "@/components/ai/ChatArena";
import { PageShell } from "@/components/SiteHeader";
import { PERSONAS } from "@/lib/ai/personas";

export const metadata: Metadata = {
  title: "Chats con IA",
  description: "Una IA intenta estafarte en un chat. Practica a no caer, sin riesgo. Exclusivo de Pro.",
};

async function Arena() {
  const access = await chatAccess();
  // Solo los datos públicos de cada escenario (sin el objetivo oculto del estafador)
  const personas = PERSONAS.map(({ id, title, description, from, channel }) => ({ id, title, description, from, channel }));
  return <ChatArena personas={personas} {...access} />;
}

export default function IaPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px]">
        <span className="eyebrow">Práctica con IA · Pro</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">¿Caerías en un chat real?</h1>
        <p className="mt-3 max-w-2xl text-lg text-fog">
          Una IA se hace pasar por un estafador y conversa contigo. Si no entregas nada y cortas la estafa, ganas XP.
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
