import { describe, expect, it } from "vitest";
import { isUnlocked, LESSON_ORDER, LESSONS, publicLesson, UNITS } from "./content";

describe("contenido de la ruta", () => {
  const all = LESSONS.flatMap((l) => l.exercises);

  it("tiene 4 unidades, 12 lecciones y 48 ejercicios con ids únicos", () => {
    expect(UNITS).toHaveLength(4);
    expect(LESSONS).toHaveLength(12);
    expect(all).toHaveLength(48);
    expect(new Set(all.map((x) => x.id)).size).toBe(48);
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(12);
  });

  it("cada respuesta apunta a una opción que existe y hay explicación", () => {
    for (const x of all) {
      expect(x.explain.length).toBeGreaterThan(10);
      if (x.kind === "veredicto") expect(["phishing", "legit"]).toContain(x.answer);
      else {
        expect(x.options.length).toBeGreaterThanOrEqual(2);
        expect(x.answer).toBeGreaterThanOrEqual(0);
        expect(x.answer).toBeLessThan(x.options.length);
      }
    }
  });

  it("la versión pública no incluye respuestas ni explicaciones", () => {
    const json = JSON.stringify(LESSONS.map(publicLesson));
    expect(json).not.toContain('"answer"');
    expect(json).not.toContain('"explain"');
  });

  it("se desbloquea en orden", () => {
    expect(isUnlocked(LESSON_ORDER[0], new Set())).toBe(true);
    expect(isUnlocked(LESSON_ORDER[1], new Set())).toBe(false);
    expect(isUnlocked(LESSON_ORDER[1], new Set([LESSON_ORDER[0]]))).toBe(true);
    expect(isUnlocked("no-existe", new Set())).toBe(false);
  });
});
