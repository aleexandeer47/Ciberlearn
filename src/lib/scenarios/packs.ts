import type { RunMode } from "@/lib/server/models";
import { SCENARIOS } from "./data";
import { PRO_SCENARIOS } from "./pro";
import type { Scenario, SignalCategory } from "./types";

export const ALL_SCENARIOS: Scenario[] = [...SCENARIOS, ...PRO_SCENARIOS];
export const SCENARIO_BY_ID = new Map(ALL_SCENARIOS.map((s) => [s.id, s]));

export const MODE_INFO: Record<RunMode, { title: string; pro: boolean; seconds?: number }> = {
  clasico: { title: "Simulador clásico", pro: false },
  pro: { title: "Pack avanzado", pro: true },
  contrarreloj: { title: "Contrarreloj", pro: true, seconds: 40 },
  entrenamiento: { title: "Entrenamiento dirigido", pro: true },
};

/** Mensajes con los que más se practica una categoría, más un legítimo para no adivinar. */
export function trainingSet(category: SignalCategory, size = 6): Scenario[] {
  const has = (s: Scenario) => s.signals.some((x) => x.category === category);
  const withCat = ALL_SCENARIOS.filter(has);
  // Si la categoría aparece en pocos mensajes, se completa con otras trampas.
  const filler = ALL_SCENARIOS.filter((s) => s.verdict === "phishing" && !has(s)).sort((a, b) => b.difficulty - a.difficulty);
  const legit = ALL_SCENARIOS.filter((s) => s.verdict === "legit");
  return [...withCat, ...filler].slice(0, size - 1).concat(legit[withCat.length % legit.length]);
}

export function scenariosFor(mode: RunMode, weakest?: SignalCategory | null): Scenario[] {
  switch (mode) {
    case "clasico":
      return SCENARIOS;
    case "pro":
      return PRO_SCENARIOS;
    case "contrarreloj":
      // Mezcla de los dos packs, ordenada por dificultad.
      return [...ALL_SCENARIOS].sort((a, b) => a.difficulty - b.difficulty).filter((_, i) => i % 2 === 0);
    case "entrenamiento":
      return trainingSet(weakest ?? "enlace");
  }
}
