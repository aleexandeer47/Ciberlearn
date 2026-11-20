import type { Scenario, SegmentedScenario, SignalCategory, Verdict } from "./scenarios/types";

export const VERDICT_POINTS = 60;
export const SIGNAL_POINTS = 40;
export const FALSE_POSITIVE_PENALTY = 5;
export const LEGIT_FALSE_POSITIVE_PENALTY = 10;

export interface ScenarioResult {
  scenarioId: string;
  verdictCorrect: boolean;
  foundSignals: string[];
  missedSignals: string[];
  falsePositives: string[];
  points: number;
}

export function scoreScenario(
  scenario: Scenario,
  segmented: SegmentedScenario,
  marked: ReadonlySet<string>,
  /** null = se acabó el tiempo sin responder (modo contrarreloj) */
  verdict: Verdict | null,
): ScenarioResult {
  const verdictCorrect = verdict === scenario.verdict;

  const markedSignals = new Set<string>();
  const falsePositives: string[] = [];
  for (const seg of segmented.all) {
    if (!marked.has(seg.key)) continue;
    if (seg.signal) markedSignals.add(seg.signal);
    else falsePositives.push(seg.key);
  }

  const foundSignals = scenario.signals.filter((s) => markedSignals.has(s.id)).map((s) => s.id);
  const missedSignals = scenario.signals.filter((s) => !markedSignals.has(s.id)).map((s) => s.id);

  let points = verdictCorrect ? VERDICT_POINTS : 0;
  if (scenario.signals.length > 0) {
    points += (SIGNAL_POINTS * foundSignals.length) / scenario.signals.length;
    points -= FALSE_POSITIVE_PENALTY * falsePositives.length;
  } else {
    // Mensaje legítimo: los puntos de inspección premian no desconfiar de lo que está bien.
    points += Math.max(0, SIGNAL_POINTS - LEGIT_FALSE_POSITIVE_PENALTY * falsePositives.length);
  }

  return {
    scenarioId: scenario.id,
    verdictCorrect,
    foundSignals,
    missedSignals,
    falsePositives,
    points: Math.round(Math.min(100, Math.max(0, points))),
  };
}

export interface CategoryStat {
  category: SignalCategory;
  found: number;
  total: number;
}

export function summarize(scenarios: Scenario[], results: ScenarioResult[]) {
  const byId = new Map(scenarios.map((s) => [s.id, s]));
  const stats = new Map<SignalCategory, CategoryStat>();

  for (const r of results) {
    const s = byId.get(r.scenarioId);
    if (!s) continue;
    for (const sig of s.signals) {
      const stat = stats.get(sig.category) ?? { category: sig.category, found: 0, total: 0 };
      stat.total += 1;
      if (r.foundSignals.includes(sig.id)) stat.found += 1;
      stats.set(sig.category, stat);
    }
  }

  const total = results.reduce((acc, r) => acc + r.points, 0);
  const max = results.length * 100;
  return {
    score: max === 0 ? 0 : Math.round((total / max) * 100),
    correctVerdicts: results.filter((r) => r.verdictCorrect).length,
    categories: [...stats.values()].sort((a, b) => a.found / a.total - b.found / b.total),
  };
}
