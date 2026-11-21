import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { chatsLeft } from "@/app/actions/ai";
import { ChatArena } from "@/components/ai/ChatArena";
import { PageShell } from "@/components/SiteHeader";
import { PERSONAS } from "@/lib/ai/personas";

export const metadata: Metadata = {
  title: "Chats con IA",
  description: "Una IA intenta estafarte en un chat. Practica a no caer, sin riesgo.",
};

async function Arena() {
  const info = await chatsLeft();
  if (!info) {
    return (
      <div className="rounded-3xl bg-field p-8 text-center">
        <p className="font-semibold">Crea tu cuenta para practicar con la IA</p>
        <p className="mt-1 text-graphite">Tienes 1 chat gratis cada día.</p>
        <Link href="/registro?next=/ia" className="btn btn-primary mt-5 h-11 px-6">
          Crear cuenta gratis
        </Link>
      </div>
    );
  }
  // Solo los datos públicos de cada escenario (sin el objetivo oculto del estafador)
  const personas = PERSONAS.map(({ id, title, description, from, channel }) => ({ id, title, description, from, channel }));
  return <ChatArena personas={personas} {...info} />;
}

export default function IaPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px]">
        <span className="eyebrow">Práctica con IA</span>
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
