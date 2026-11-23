import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Simulator } from "@/components/simulator/Simulator";
import { getT } from "@/lib/i18n-server";
import { getScenarios } from "@/lib/scenarios/data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("Simulador de phishing", "Phishing simulator"),
    description: t(
      "10 mensajes ficticios. Encuentra las señales de estafa y descubre qué tan buen ojo tienes.",
      "10 fictional messages. Find the signs of a scam and see how sharp your eye is.",
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
