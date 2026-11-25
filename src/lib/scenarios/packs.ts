import type { Lang } from "@/lib/i18n";
import type { RunMode } from "@/lib/server/models";
import { getScenarios } from "./data";
import { EXTRA_SCENARIOS } from "./extra";
import { EXTRA_SCENARIOS_EN } from "./extra.en";
import { PRO_SCENARIOS } from "./pro";
import { PRO_SCENARIOS_EN } from "./pro.en";
import type { Scenario, SignalCategory } from "./types";

export const getProScenarios = (lang: Lang) => (lang === "en" ? PRO_SCENARIOS_EN : PRO_SCENARIOS);

/** Banco gratuito: los 10 clásicos + los extra. Cada ronda clásica elige 10 al azar (round.ts). */
const FREE: Record<Lang, Scenario[]> = {
  es: [...getScenarios("es"), ...EXTRA_SCENARIOS],
  en: [...getScenarios("en"), ...EXTRA_SCENARIOS_EN],
};
export const freeScenarios = (lang: Lang) => FREE[lang];

const ALL: Record<Lang, Scenario[]> = {
  es: [...FREE.es, ...PRO_SCENARIOS],
  en: [...FREE.en, ...PRO_SCENARIOS_EN],
};
const BY_ID: Record<Lang, Map<string, Scenario>> = {
  es: new Map(ALL.es.map((s) => [s.id, s])),
  en: new Map(ALL.en.map((s) => [s.id, s])),
};

export const allScenarios = (lang: Lang) => ALL[lang];
export const scenarioById = (lang: Lang, id: string) => BY_ID[lang].get(id);

export const MODE_INFO: Record<RunMode, { title: Record<Lang, string>; pro: boolean; seconds?: number }> = {
  clasico: { title: { es: "Simulador clásico", en: "Classic simulator" }, pro: false },
  pro: { title: { es: "Pack avanzado", en: "Advanced pack" }, pro: true },
  contrarreloj: { title: { es: "Contrarreloj", en: "Time trial" }, pro: true, seconds: 40 },
  entrenamiento: { title: { es: "Entrenamiento dirigido", en: "Targeted training" }, pro: true },
};

/** Mensajes con los que más se practica una categoría, más un legítimo para no adivinar. */
export function trainingSet(category: SignalCategory, size = 6, lang: Lang = "es"): Scenario[] {
  const all = ALL[lang];
  const has = (s: Scenario) => s.signals.some((x) => x.category === category);
  const withCat = all.filter(has);
  // Si la categoría aparece en pocos mensajes, se completa con otras trampas.
  const filler = all.filter((s) => s.verdict === "phishing" && !has(s)).sort((a, b) => b.difficulty - a.difficulty);
  const legit = all.filter((s) => s.verdict === "legit");
  return [...withCat, ...filler].slice(0, size - 1).concat(legit[withCat.length % legit.length]);
}

export function scenariosFor(mode: RunMode, weakest?: SignalCategory | null, lang: Lang = "es"): Scenario[] {
  switch (mode) {
    case "clasico":
      return getScenarios(lang);
    case "pro":
      return getProScenarios(lang);
    case "contrarreloj":
      // Mezcla de los dos packs, ordenada por dificultad.
      return [...ALL[lang]].sort((a, b) => a.difficulty - b.difficulty).filter((_, i) => i % 3 === 0).slice(0, 10);
    case "entrenamiento":
      return trainingSet(weakest ?? "enlace", 6, lang);
  }
}
