import { describe, expect, it } from "vitest";
import { freeScenarios } from "./packs";
import { pickRound, ROUND_LEGIT, ROUND_SIZE } from "./round";

describe("rondas del simulador clásico", () => {
  const pool = freeScenarios("es");

  it("el banco gratuito tiene muchos más casos que una ronda", () => {
    expect(pool.length).toBeGreaterThanOrEqual(ROUND_SIZE * 2);
    expect(freeScenarios("en").map((s) => s.id)).toEqual(pool.map((s) => s.id));
  });

  it("cada ronda trae 10 mensajes distintos con 3 reales, de fácil a difícil", () => {
    for (let k = 0; k < 20; k++) {
      const r = pickRound(pool);
      expect(r).toHaveLength(ROUND_SIZE);
      expect(new Set(r.map((s) => s.id)).size).toBe(ROUND_SIZE);
      expect(r.filter((s) => s.verdict === "legit")).toHaveLength(ROUND_LEGIT);
      for (let i = 1; i < r.length; i++) expect(r[i].difficulty).toBeGreaterThanOrEqual(r[i - 1].difficulty);
    }
  });

  it("evita repetir los mensajes de la ronda anterior mientras alcance el banco", () => {
    const first = pickRound(pool);
    const second = pickRound(pool, first.map((s) => s.id));
    const repeated = second.filter((s) => first.some((f) => f.id === s.id));
    // Solo se repiten los que faltan en el banco para completar la ronda
    const freshPhishing = pool.filter((s) => s.verdict === "phishing" && !first.some((f) => f.id === s.id)).length;
    const freshLegit = pool.filter((s) => s.verdict === "legit" && !first.some((f) => f.id === s.id)).length;
    const expected = Math.max(0, ROUND_SIZE - ROUND_LEGIT - freshPhishing) + Math.max(0, ROUND_LEGIT - freshLegit);
    expect(repeated.length).toBe(expected);
  });

  it("no siempre sale la misma ronda", () => {
    const ids = new Set(Array.from({ length: 10 }, () => pickRound(pool).map((s) => s.id).join(",")));
    expect(ids.size).toBeGreaterThan(1);
  });
});
