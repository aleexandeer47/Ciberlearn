import { describe, expect, it } from "vitest";
import { FEATURES } from "@/lib/plans";
import {
  EXERCISE_BY_ID,
  isUnlocked,
  LESSON_ORDER,
  LESSONS,
  localizeExercise,
  publicLesson,
  UNITS,
  unitsFor,
} from "./content";
import { EXERCISES_EN, LESSONS_EN, UNITS_EN } from "./content.en";

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
    expect(FEATURES[0].label.es).toBe(`Ruta guiada: ${LESSONS.length} lecciones, ${all.length} ejercicios`);
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

describe("versión en inglés", () => {
  it("cada unidad, lección y ejercicio tiene su traducción, y nada sobra", () => {
    expect(Object.keys(UNITS_EN).sort()).toEqual(UNITS.map((u) => u.id).sort());
    expect(Object.keys(LESSONS_EN).sort()).toEqual(LESSONS.map((l) => l.id).sort());
    expect(Object.keys(EXERCISES_EN).sort()).toEqual([...EXERCISE_BY_ID.keys()].sort());
  });

  it("los ejercicios traducidos conservan su forma (opciones y respuesta)", () => {
    for (const ex of EXERCISE_BY_ID.values()) {
      const en = localizeExercise(ex, "en");
      expect(en.kind).toBe(ex.kind);
      expect(en.answer).toBe(ex.answer);
      if (ex.kind === "veredicto" && en.kind === "veredicto") {
        expect(en.text).not.toBe(ex.text);
        expect(en.channel).toBe(ex.channel);
      } else if (ex.kind !== "veredicto" && en.kind !== "veredicto") {
        expect(en.options.length, ex.id).toBe(ex.options.length);
        expect(en.prompt).not.toBe(ex.prompt);
        expect(!!en.context, `${ex.id} context`).toBe(!!ex.context);
      }
    }
    expect(unitsFor("en")[0].title).toBe("Who's writing to you?");
  });
});
