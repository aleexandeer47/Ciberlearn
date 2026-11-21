import { describe, expect, it } from "vitest";
import { FEATURES } from "@/lib/plans";
import { isUnlocked, LESSON_ORDER, LESSONS, publicLesson, UNITS } from "./content";

describe("contenido de la ruta", () => {
  const all = LESSONS.flatMap((l) => l.exercises);

  it("tiene 8 unidades, 24 lecciones y 102 ejercicios con ids únicos", () => {
    expect(UNITS).toHaveLength(8);
    expect(LESSONS).toHaveLength(24);
    expect(all).toHaveLength(102);
    expect(new Set(all.map((x) => x.id)).size).toBe(all.length);
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
  });

  it("cada id de ejercicio empieza con el de su lección", () => {
    for (const l of LESSONS) for (const x of l.exercises) expect(x.id.startsWith(l.id)).toBe(true);
  });

  it("la última unidad es la prueba de nivel experto, más larga que el resto", () => {
    const last = UNITS[UNITS.length - 1];
    expect(last.level).toBe("Experto");
    for (const l of last.lessons) expect(l.exercises.length).toBeGreaterThan(4);
    // Mezcla trampas con mensajes reales para no premiar decir “trampa” a todo
    const verdicts = last.lessons.flatMap((l) => l.exercises).filter((x) => x.kind === "veredicto");
    expect(verdicts.some((x) => x.answer === "legit")).toBe(true);
  });

  it("la página de planes anuncia la cantidad real de lecciones y ejercicios", () => {
    expect(FEATURES[0].label).toBe(`Ruta guiada: ${LESSONS.length} lecciones, ${all.length} ejercicios`);
  });

  it("las opciones no se repiten dentro de un ejercicio", () => {
    for (const x of all) if (x.kind !== "veredicto") expect(new Set(x.options).size).toBe(x.options.length);
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
