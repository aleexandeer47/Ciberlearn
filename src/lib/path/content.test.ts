import { describe, expect, it } from "vitest";
import { FEATURES } from "@/lib/plans";
import {
  BOSS,
  bossTally,
  EXERCISE_BY_ID,
  SECTION_2_START,
  gradeExercise,
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

  it("tiene 13 unidades (8 + 5 de la sección 2), 39 lecciones y 212 ejercicios con ids únicos", () => {
    expect(UNITS).toHaveLength(13);
    expect(SECTION_2_START).toBe(8);
    expect(LESSONS).toHaveLength(39);
    expect(all).toHaveLength(212);
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
    for (const x of all) {
      if (x.kind === "opcion" || x.kind === "enlace") expect(new Set(x.options).size).toBe(x.options.length);
      if (x.kind === "senales") expect(new Set(x.parts).size).toBe(x.parts.length);
      if (x.kind === "ordenar") expect(new Set(x.items).size).toBe(x.items.length);
    }
  });

  it("cada respuesta apunta a una opción que existe y hay explicación", () => {
    for (const x of all) {
      expect(x.explain.length).toBeGreaterThan(10);
      if (x.kind === "veredicto") expect(["phishing", "legit"]).toContain(x.answer);
      else if (x.kind === "senales") {
        expect(x.parts.length, x.id).toBeGreaterThanOrEqual(3);
        expect(new Set(x.answer).size).toBe(x.answer.length);
        for (const i of x.answer) expect(i >= 0 && i < x.parts.length, x.id).toBe(true);
      } else if (x.kind === "ordenar") {
        // Una permutación completa de los pasos, y no ya ordenada (si no, no hay nada que hacer)
        expect([...x.answer].sort(), x.id).toEqual(x.items.map((_, i) => i));
        expect(x.answer.some((v, i) => v !== i), x.id).toBe(true);
      } else {
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
      } else if (ex.kind === "senales" && en.kind === "senales") {
        expect(en.parts.length, ex.id).toBe(ex.parts.length);
        expect(en.parts.join(" ")).not.toBe(ex.parts.join(" "));
      } else if (ex.kind === "ordenar" && en.kind === "ordenar") {
        expect(en.items.length, ex.id).toBe(ex.items.length);
        expect(en.prompt).not.toBe(ex.prompt);
      } else if ((ex.kind === "opcion" || ex.kind === "enlace") && (en.kind === "opcion" || en.kind === "enlace")) {
        expect(en.options.length, ex.id).toBe(ex.options.length);
        expect(en.prompt).not.toBe(ex.prompt);
        expect(!!en.context, `${ex.id} context`).toBe(!!ex.context);
      }
    }
    expect(unitsFor("en")[0].title).toBe("Who's writing to you?");
  });
});

describe("batalla contra el Leviatán", () => {
  const boss = LESSONS.filter((l) => l.boss);

  it("hay una sola batalla y es la última lección de toda la ruta", () => {
    expect(boss).toHaveLength(1);
    expect(LESSON_ORDER[LESSON_ORDER.length - 1]).toBe(boss[0].id);
  });

  it("sus preguntas se responden en segundos: Real o Trampa, con mezcla de las dos", () => {
    for (const x of boss[0].exercises) {
      expect(x.kind, x.id).toBe("enlace");
      if (x.kind !== "enlace") continue;
      expect(x.options).toEqual(["Real", "Trampa"]);
      expect(x.context, x.id).toBeTruthy();
      expect(x.context!.length, x.id).toBeLessThan(70);
    }
    const answers = boss[0].exercises.map((x) => (x.kind === "enlace" ? x.answer : -1));
    expect(answers).toContain(0);
    expect(answers).toContain(1);
  });

  it("alcanzan las preguntas para ganar aunque se fallen las permitidas", () => {
    expect(boss[0].exercises.length).toBeGreaterThanOrEqual(BOSS.hp + BOSS.hearts - 1);
  });

  it("se gana con suficientes aciertos y se pierde al fallar todas las vidas", () => {
    const hits = Object.fromEntries(Array.from({ length: BOSS.hp }, (_, i) => [`a${i}`, true]));
    expect(bossTally(hits).won).toBe(true);
    const almost = { ...Object.fromEntries(Array.from({ length: BOSS.hp - 1 }, (_, i) => [`a${i}`, true])), x: false };
    expect(bossTally(almost)).toMatchObject({ won: false, lost: false });
    const misses = Object.fromEntries(Array.from({ length: BOSS.hearts }, (_, i) => [`m${i}`, false]));
    expect(bossTally(misses)).toMatchObject({ won: false, lost: true });
  });
});

describe("ejercicios interactivos", () => {
  const all = LESSONS.flatMap((l) => l.exercises);
  it("cada lección tiene al menos un ejercicio de señales u ordenar (menos la batalla, que es de preguntas rápidas)", () => {
    for (const l of LESSONS.filter((x) => !x.boss))
      expect(l.exercises.some((x) => x.kind === "senales" || x.kind === "ordenar"), l.id).toBe(true);
  });
  it("hay mensajes reales en “toca las señales” (respuesta: nada sospechoso)", () => {
    expect(all.some((x) => x.kind === "senales" && x.answer.length === 0)).toBe(true);
  });
  it("califica señales sin importar el orden y exige el orden exacto al ordenar", () => {
    const s = all.find((x) => x.kind === "senales" && x.answer.length > 1)!;
    const o = all.find((x) => x.kind === "ordenar")!;
    if (s.kind !== "senales" || o.kind !== "ordenar") throw new Error("tipos");
    expect(gradeExercise(s, [...s.answer].reverse())).toBe(true);
    expect(gradeExercise(s, s.answer.slice(1))).toBe(false);
    expect(gradeExercise(s, [...s.answer, 99])).toBe(false);
    expect(gradeExercise(o, o.answer)).toBe(true);
    expect(gradeExercise(o, [...o.answer].reverse())).toBe(false);
    expect(gradeExercise(o, "0")).toBe(false);
  });
});
