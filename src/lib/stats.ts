// Estadísticas de una persona a partir de sus rondas guardadas. Funciones puras.
import type { Lang } from "./i18n";
import { CATEGORIES, categoryLabels } from "./scenarios/categories";
import type { SignalCategory } from "./scenarios/types";

export interface StatAnswer {
  scenarioId: string;
  verdictCorrect: boolean;
  points: number;
  falsePositives: number;
  signals: { category: SignalCategory; found: boolean }[];
}

export interface StatRun {
  mode: string;
  createdAt: Date;
  score: number;
  answers: StatAnswer[];
}

export const LEVELS = [
  { xp: 0, name: { es: "Novato", en: "Rookie" } },
  { xp: 500, name: { es: "Observador", en: "Observer" } },
  { xp: 1500, name: { es: "Detective", en: "Detective" } },
  { xp: 3500, name: { es: "Analista", en: "Analyst" } },
  { xp: 7000, name: { es: "Ojo de halcón", en: "Hawk eye" } },
] as const;

export function levelFor(xp: number, lang: Lang = "es") {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  return {
    index: i + 1,
    name: cur.name[lang],
    nextName: next?.name[lang] ?? null,
    progress: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1,
    toNext: next ? next.xp - xp : 0,
  };
}

export interface Skill {
  category: SignalCategory;
  label: string;
  found: number;
  total: number;
  /** 0-100 */
  pct: number;
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** Días seguidos con al menos una ronda, contando hasta hoy o ayer. */
export function streakDays(dates: Date[], now = new Date()) {
  const days = new Set(dates.map(dayKey));
  const d = new Date(now);
  if (!days.has(dayKey(d))) d.setUTCDate(d.getUTCDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}

export function computeStats(runs: StatRun[], lang: Lang = "es", now = new Date()) {
  const L = categoryLabels(lang);
  const en = lang === "en";
  const answers = runs.flatMap((r) => r.answers);
  const xp = answers.reduce((a, x) => a + x.points, 0);

  const skillMap = new Map<SignalCategory, { found: number; total: number }>();
  for (const c of CATEGORIES) skillMap.set(c, { found: 0, total: 0 });
  for (const a of answers)
    for (const s of a.signals) {
      const v = skillMap.get(s.category)!;
      v.total++;
      if (s.found) v.found++;
    }
  const skills: Skill[] = [...skillMap.entries()].map(([category, v]) => ({
    category,
    label: L[category].label,
    ...v,
    pct: v.total ? Math.round((v.found / v.total) * 100) : 0,
  }));
  const practiced = skills.filter((s) => s.total > 0);
  const weakest = practiced.length ? [...practiced].sort((a, b) => a.pct - b.pct)[0] : null;
  const strongest = practiced.length ? [...practiced].sort((a, b) => b.pct - a.pct)[0] : null;

  const sorted = [...runs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const best = runs.reduce((m, r) => Math.max(m, r.score), 0);
  const streak = streakDays(runs.map((r) => r.createdAt), now);

  const achievements = [
    {
      id: "primer-sello",
      title: en ? "First stamp" : "Primer sello",
      desc: en ? "Finish your first round" : "Termina tu primera ronda",
      earned: runs.length >= 1,
    },
    {
      id: "perfecto",
      title: en ? "Perfect" : "Perfecto",
      desc: en ? "Score 100 on a message" : "Saca 100 en un mensaje",
      earned: answers.some((a) => a.points === 100),
    },
    {
      id: "impecable",
      title: en ? "Flawless round" : "Ronda impecable",
      desc: en ? "Get every verdict right in a round" : "Acierta todos los veredictos de una ronda",
      earned: runs.some((r) => r.answers.length >= 5 && r.answers.every((a) => a.verdictCorrect)),
    },
    {
      id: "cazaenlaces",
      title: en ? "Link hunter" : "Cazaenlaces",
      desc: en ? "Spot 10 deceptive links" : "Detecta 10 enlaces engañosos",
      earned: answers.flatMap((a) => a.signals).filter((s) => s.category === "enlace" && s.found).length >= 10,
    },
    {
      id: "constancia",
      title: en ? "Consistency" : "Constancia",
      desc: en ? "Practice 3 days in a row" : "Practica 3 días seguidos",
      earned: streak >= 3,
    },
    {
      id: "detective",
      title: "Detective",
      desc: en ? "Reach Detective level" : "Llega al nivel Detective",
      earned: xp >= 1500,
    },
    {
      id: "sin-paranoia",
      title: en ? "Surgical precision" : "Precisión quirúrgica",
      desc: en ? "Find half the signs without marking anything normal" : "Encuentra la mitad de las señales sin marcar nada normal",
      earned: runs.some((r) => {
        const sig = r.answers.flatMap((a) => a.signals);
        return (
          r.answers.length >= 5 &&
          r.answers.every((a) => a.falsePositives === 0) &&
          sig.length > 0 &&
          sig.filter((s) => s.found).length / sig.length >= 0.5
        );
      }),
    },
  ];

  return {
    xp,
    level: levelFor(xp, lang),
    runs: runs.length,
    messages: answers.length,
    accuracy: answers.length ? Math.round((answers.filter((a) => a.verdictCorrect).length / answers.length) * 100) : 0,
    bestScore: best,
    avgScore: runs.length ? Math.round(runs.reduce((a, r) => a + r.score, 0) / runs.length) : 0,
    streak,
    skills,
    weakest,
    strongest,
    history: sorted.map((r) => ({ date: r.createdAt.toISOString(), score: r.score, mode: r.mode })),
    achievements,
  };
}

export type Stats = ReturnType<typeof computeStats>;
