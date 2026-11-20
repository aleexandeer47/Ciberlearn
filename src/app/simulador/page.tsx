import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Simulator } from "@/components/simulator/Simulator";
import { SCENARIOS } from "@/lib/scenarios/data";

export const metadata: Metadata = {
  title: "Simulador de phishing",
  description: "10 mensajes ficticios. Encuentra las señales de estafa y descubre qué tan buen ojo tienes.",
};

export default function SimuladorPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Simulator scenarios={SCENARIOS} />
      </main>
      <SiteFooter />
    </>
  );
}
