import { describe, expect, it } from "vitest";
import { extendPro, isProActive } from "./plans";
import { computeStats, levelFor, streakDays, type StatRun } from "./stats";

const day = (s: string) => new Date(`${s}T15:00:00Z`);

const run = (date: string, points: number[], enlaceFound = true): StatRun => ({
  mode: "clasico",
  createdAt: day(date),
  score: Math.round(points.reduce((a, b) => a + b, 0) / points.length),
  answers: points.map((p, i) => ({
    scenarioId: `s${i}`,
    verdictCorrect: p >= 60,
    points: p,
    falsePositives: 0,
    signals: [
      { category: "enlace", found: enlaceFound },
      { category: "urgencia", found: false },
    ],
  })),
});

describe("niveles", () => {
  it("sube de nivel en los umbrales", () => {
    expect(levelFor(0).name).toBe("Novato");
    expect(levelFor(499).name).toBe("Novato");
    expect(levelFor(500).name).toBe("Observador");
    expect(levelFor(9999).name).toBe("Ojo de halcón");
    expect(levelFor(9999).nextName).toBeNull();
    expect(levelFor(1000).progress).toBeCloseTo(0.5);
    expect(levelFor(9999, "en").name).toBe("Hawk eye");
  });
});

describe("racha de días", () => {
  const now = day("2026-11-19");
  it("cuenta días seguidos hasta hoy", () => {
    expect(streakDays([day("2026-11-19"), day("2026-11-18"), day("2026-11-17")], now)).toBe(3);
  });
  it("no se rompe si hoy todavía no practicó", () => {
    expect(streakDays([day("2026-11-18"), day("2026-11-17")], now)).toBe(2);
  });
  it("se corta con un día sin práctica", () => {
    expect(streakDays([day("2026-11-19"), day("2026-11-17")], now)).toBe(1);
    expect(streakDays([day("2026-11-10")], now)).toBe(0);
  });
});

describe("computeStats", () => {
  it("calcula XP, skills, debilidad e insignias", () => {
    const s = computeStats([run("2026-11-18", [100, 100, 100, 100, 100]), run("2026-11-19", [40, 80], false)], "es", day("2026-11-19"));
    expect(s.xp).toBe(620);
    expect(s.level.name).toBe("Observador");
    expect(s.messages).toBe(7);
    const enlace = s.skills.find((k) => k.category === "enlace")!;
    expect(enlace).toMatchObject({ found: 5, total: 7, pct: 71 });
    expect(s.weakest?.category).toBe("urgencia");
    expect(s.achievements.find((a) => a.id === "perfecto")?.earned).toBe(true);
    expect(s.achievements.find((a) => a.id === "impecable")?.earned).toBe(true);
    expect(s.history.map((h) => h.score)).toEqual([100, 60]);
  });

  it("no regala 'Precisión quirúrgica' por no marcar nada", () => {
    const sinMarcar = computeStats([run("2026-11-19", [60, 60, 60, 60, 60], false)]);
    expect(sinMarcar.achievements.find((a) => a.id === "sin-paranoia")?.earned).toBe(false);
    const conMarcas = computeStats([run("2026-11-19", [80, 80, 80, 80, 80], true)]);
    expect(conMarcas.achievements.find((a) => a.id === "sin-paranoia")?.earned).toBe(true);
  });

  it("funciona sin rondas", () => {
    const s = computeStats([]);
    expect(s.xp).toBe(0);
    expect(s.weakest).toBeNull();
    expect(s.accuracy).toBe(0);
  });
});

describe("planes", () => {
  const now = day("2026-11-19");
  it("extiende desde hoy si el plan venció y desde el final si sigue activo", () => {
    expect(extendPro(null, 30, now).toISOString().slice(0, 10)).toBe("2026-12-19");
    expect(extendPro(day("2026-11-01"), 30, now).toISOString().slice(0, 10)).toBe("2026-12-19");
    expect(extendPro(day("2026-12-01"), 30, now).toISOString().slice(0, 10)).toBe("2026-12-31");
  });
  it("detecta si Pro está activo", () => {
    expect(isProActive(day("2026-11-20"), now)).toBe(true);
    expect(isProActive(day("2026-11-18"), now)).toBe(false);
    expect(isProActive(null, now)).toBe(false);
  });
});
