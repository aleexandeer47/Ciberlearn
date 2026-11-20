import { describe, expect, it } from "vitest";
import { SCENARIOS } from "./scenarios/data";
import { ALL_SCENARIOS, scenariosFor, trainingSet } from "./scenarios/packs";
import { segmentScenario } from "./scenarios/segment";
import { scoreScenario, summarize } from "./scoring";

const phishing = SCENARIOS.find((s) => s.id === "banco-bloqueo")!;
const legit = SCENARIOS.find((s) => s.id === "banco-estado-cuenta")!;

describe("escenarios", () => {
  it("tienen ids únicos entre todos los packs", () => {
    const ids = ALL_SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada modo produce un set válido", () => {
    for (const mode of ["clasico", "pro", "contrarreloj", "entrenamiento"] as const) {
      expect(scenariosFor(mode, "adjunto").length).toBeGreaterThanOrEqual(5);
    }
    const t = trainingSet("adjunto");
    expect(t.some((s) => s.verdict === "legit")).toBe(true);
    expect(t.filter((s) => s.signals.some((x) => x.category === "adjunto")).length).toBeGreaterThanOrEqual(2);
  });

  it.each(ALL_SCENARIOS.map((s) => [s.id, s] as const))("%s está bien armado", (_id, s) => {
    const seg = segmentScenario(s);
    const used = new Set(seg.all.map((x) => x.signal).filter(Boolean));
    const declared = new Set(s.signals.map((x) => x.id));

    expect(declared.size).toBe(s.signals.length);
    for (const id of declared) expect(used, `señal ${id} sin texto`).toContain(id);
    for (const id of used) expect(declared, `texto apunta a señal ${id} inexistente`).toContain(id);

    const keys = seg.all.map((x) => x.key);
    expect(new Set(keys).size).toBe(keys.length);

    if (s.verdict === "phishing") expect(s.signals.length).toBeGreaterThan(0);
    else {
      expect(s.signals).toHaveLength(0);
      expect(s.legitReasons?.length).toBeGreaterThan(0);
    }
  });
});

describe("scoreScenario", () => {
  const seg = segmentScenario(phishing);
  const signalKeys = (ids: string[]) =>
    new Set(seg.all.filter((x) => x.signal && ids.includes(x.signal)).map((x) => x.key));

  it("da 100 con veredicto correcto y todas las señales", () => {
    const r = scoreScenario(phishing, seg, signalKeys(phishing.signals.map((s) => s.id)), "phishing");
    expect(r.points).toBe(100);
    expect(r.missedSignals).toEqual([]);
  });

  it("cuenta una señal aunque tenga varios fragmentos marcados", () => {
    const r = scoreScenario(phishing, seg, signalKeys(["urgencia"]), "phishing");
    expect(r.foundSignals).toEqual(["urgencia"]);
    expect(r.points).toBe(60 + 8);
  });

  it("resta por falsos positivos sin bajar de 0", () => {
    const noise = new Set(seg.all.filter((x) => !x.signal).map((x) => x.key));
    const r = scoreScenario(phishing, seg, noise, "legit");
    expect(r.falsePositives.length).toBe(noise.size);
    expect(r.points).toBe(0);
  });

  it("premia no marcar nada en un mensaje legítimo", () => {
    const lseg = segmentScenario(legit);
    expect(scoreScenario(legit, lseg, new Set(), "legit").points).toBe(100);
    const one = new Set([lseg.all[0].key]);
    expect(scoreScenario(legit, lseg, one, "legit").points).toBe(90);
    expect(scoreScenario(legit, lseg, new Set(), "phishing").points).toBe(40);
  });
});

describe("summarize", () => {
  it("calcula el puntaje global y ordena las categorías de peor a mejor", () => {
    const seg = segmentScenario(phishing);
    const r = scoreScenario(phishing, seg, new Set(), "phishing");
    const sum = summarize(SCENARIOS, [r]);
    expect(sum.score).toBe(60);
    expect(sum.correctVerdicts).toBe(1);
    expect(sum.categories.every((c) => c.found === 0)).toBe(true);
  });
});
