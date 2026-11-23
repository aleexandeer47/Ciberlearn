import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Simulator } from "@/components/simulator/Simulator";
import { getT } from "@/lib/i18n-server";
import { getScenarios } from "@/lib/scenarios/data";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    alternates: await alternatesFor("/simulador"),
    title: t("Simulador de phishing: identifica correos falsos", "Phishing simulator: spot fake emails"),
    description: t(
      "Practica gratis con 10 mensajes ficticios: correos falsos, SMS y estafas por WhatsApp. Encuentra las señales de phishing y descubre qué tan buen ojo tienes.",
      "Practice for free with 10 fictional messages: fake emails, texts and WhatsApp scams. Find the signs of phishing and see how sharp your eye is.",
    ),
  };
}

export default async function SimuladorPage() {
  const { lang } = await getT();
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Simulator scenarios={getScenarios(lang)} />
      </main>
      <SiteFooter />
    </>
  );
}
