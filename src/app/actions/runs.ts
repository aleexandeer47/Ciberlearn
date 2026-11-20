"use server";

import { ObjectId } from "mongodb";
import { MODE_INFO, SCENARIO_BY_ID } from "@/lib/scenarios/packs";
import { SCENARIOS } from "@/lib/scenarios/data";
import { segmentScenario } from "@/lib/scenarios/segment";
import type { Verdict } from "@/lib/scenarios/types";
import { scoreScenario } from "@/lib/scoring";
import { collections } from "@/lib/server/db";
import type { AnswerDoc, RunMode } from "@/lib/server/models";
import { getCurrentUser } from "@/lib/server/session";

export interface RunInput {
  mode: RunMode;
  answers: { scenarioId: string; marked: string[]; verdict: Verdict | null; timeMs?: number }[];
}

export type SaveRunResult = { ok: true; score: number } | { ok: false; error: string };

const FREE_IDS = new Set(SCENARIOS.map((s) => s.id));

/**
 * Guarda una ronda. El servidor recalcula todo a partir de lo que la persona
 * marcó y decidió: los puntos que muestre el navegador no se usan.
 */
export async function saveRun(input: RunInput): Promise<SaveRunResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Inicia sesión para guardar tu progreso." };

  const info = MODE_INFO[input?.mode];
  if (!info) return { ok: false, error: "Modo desconocido." };
  if (info.pro && !user.isPro) return { ok: false, error: "Este modo es parte del plan Pro." };
  if (!Array.isArray(input.answers) || input.answers.length === 0 || input.answers.length > 20)
    return { ok: false, error: "Ronda inválida." };

  const seen = new Set<string>();
  const answers: AnswerDoc[] = [];
  for (const a of input.answers) {
    const scenario = SCENARIO_BY_ID.get(a?.scenarioId);
    if (!scenario || seen.has(scenario.id)) return { ok: false, error: "Ronda inválida." };
    if (!user.isPro && !FREE_IDS.has(scenario.id)) return { ok: false, error: "Mensaje del plan Pro." };
    seen.add(scenario.id);

    const verdict = a.verdict === "phishing" || a.verdict === "legit" ? a.verdict : null;
    const segmented = segmentScenario(scenario);
    const validKeys = new Set(segmented.all.map((s) => s.key));
    const marked = new Set((Array.isArray(a.marked) ? a.marked : []).filter((k) => typeof k === "string" && validKeys.has(k)));
    const r = scoreScenario(scenario, segmented, marked, verdict);

    answers.push({
      scenarioId: scenario.id,
      verdict,
      verdictCorrect: r.verdictCorrect,
      points: r.points,
      falsePositives: r.falsePositives.length,
      signals: scenario.signals.map((s) => ({ id: s.id, category: s.category, found: r.foundSignals.includes(s.id) })),
      ...(typeof a.timeMs === "number" && a.timeMs >= 0 ? { timeMs: Math.min(Math.round(a.timeMs), 600_000) } : {}),
    });
  }

  const score = Math.round(answers.reduce((acc, x) => acc + x.points, 0) / answers.length);
  const { runs } = await collections();
  await runs.insertOne({ _id: new ObjectId(), userId: user._id, mode: input.mode, createdAt: new Date(), score, answers });
  return { ok: true, score };
}
