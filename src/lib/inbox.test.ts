import { describe, expect, it } from "vitest";
import { AREAS, readinessLevel, readinessScore, recommendations, subjectMatches } from "./business";
import { gradeInbox, INBOX_BY_ID, INBOX_EMAILS, INBOX_SIZE, outcomeOf, pickInbox, publicInbox } from "./inbox";
import { LESSON_BY_ID } from "./path/content";

describe("bandeja de entrenamiento", () => {
  it("cada correo tiene id único, explicación y mezcla de reales y trampas", () => {
    expect(new Set(INBOX_EMAILS.map((e) => e.id)).size).toBe(INBOX_EMAILS.length);
    for (const e of INBOX_EMAILS) expect(e.explain.length).toBeGreaterThan(20);
    expect(INBOX_EMAILS.filter((e) => e.verdict === "legit").length).toBeGreaterThanOrEqual(4);
  });

  it("cada sesión trae 8 correos sin repetir, con al menos 3 reales y 3 trampas", () => {
    for (let s = 0; s < 20; s++) {
      let seed = s + 1;
      const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      const ids = pickInbox(rand);
      expect(ids).toHaveLength(INBOX_SIZE);
      expect(new Set(ids).size).toBe(INBOX_SIZE);
      const legit = ids.filter((id) => INBOX_BY_ID.get(id)!.verdict === "legit").length;
      expect(legit).toBeGreaterThanOrEqual(3);
      expect(INBOX_SIZE - legit).toBeGreaterThanOrEqual(3);
    }
  });

  it("califica cada acción", () => {
    expect(outcomeOf("phishing", "reportar")).toBe("excelente");
    expect(outcomeOf("phishing", "eliminar")).toBe("bien");
    expect(outcomeOf("phishing", "abrir")).toBe("cayo");
    expect(outcomeOf("phishing", "seguro")).toBe("error");
    expect(outcomeOf("legit", "seguro")).toBe("excelente");
    expect(outcomeOf("legit", "reportar")).toBe("error");
  });

  it("calcula puntaje, reportes, clics y falsos positivos", () => {
    const r = gradeInbox(["b01", "b02", "b03", "b04"], { b01: "reportar", b02: "reportar", b03: "abrir", b04: "seguro" });
    expect(r.score).toBe(50); // 2 + 0 + 0 + 2 de 8
    expect(r.reported).toBe(1);
    expect(r.clicked).toBe(1);
    expect(r.falsePositives).toBe(1);
    expect(r.phishing).toBe(2);
  });

  it("la versión pública no trae la respuesta", () => {
    const json = JSON.stringify(INBOX_EMAILS.map(publicInbox));
    expect(json).not.toContain('"verdict"');
    expect(json).not.toContain('"explain"');
  });
});

describe("empresa: áreas, índice y reportes", () => {
  it("cada área apunta a lecciones que existen", () => {
    for (const a of Object.values(AREAS)) for (const id of a.lessons) expect(LESSON_BY_ID.has(id)).toBe(true);
  });

  it("el índice pondera y reparte el peso de lo que falta", () => {
    expect(readinessScore({ pathPct: null, inboxScore: null, clickRate: null, reportRate: null })).toBeNull();
    expect(readinessScore({ pathPct: 80, inboxScore: null, clickRate: null, reportRate: null })).toBe(80);
    // 0.3*100 + 0.25*80 + 0.3*(100-20) + 0.15*50 = 81.5
    expect(readinessScore({ pathPct: 100, inboxScore: 80, clickRate: 20, reportRate: 50 })).toBe(82);
    expect(readinessLevel(82).label).toBe("Preparada");
    expect(readinessLevel(60).label).toBe("En progreso");
    expect(readinessLevel(30).label).toBe("En riesgo");
  });

  it("da recomendaciones según los puntos débiles", () => {
    const weak = recommendations({ pathPct: 10, inboxScore: 40, clickRate: 50, reportRate: 0 }, "Enlace engañoso", 2);
    expect(weak.length).toBeGreaterThanOrEqual(4);
    expect(weak.join(" ")).toMatch(/simulacro/);
    const strong = recommendations({ pathPct: 90, inboxScore: 95, clickRate: 0, reportRate: 80 }, null, 0);
    expect(strong).toHaveLength(0);
  });

  it("reconoce el asunto de un simulacro aunque cambien tildes o mayúsculas", () => {
    const sent = "Acción requerida: su buzón alcanzó el 98% de capacidad";
    expect(subjectMatches("accion requerida su buzon alcanzo el 98", sent)).toBe(true);
    expect(subjectMatches("RE: Acción requerida: su buzón alcanzó el 98% de capacidad", sent)).toBe(true);
    expect(subjectMatches("Factura de octubre", sent)).toBe(false);
    expect(subjectMatches("hola", sent)).toBe(false);
  });
});

import { INBOX_EN } from "./inbox.en";
import { INBOX_EMAILS as ALL, localizeInbox } from "./inbox";

describe("bandeja en inglés", () => {
  it("cada correo tiene su versión en inglés con enlace y adjunto coherentes", () => {
    expect(Object.keys(INBOX_EN).sort()).toEqual(ALL.map((e) => e.id).sort());
    for (const e of ALL) {
      const en = localizeInbox(e, "en");
      expect(en.verdict).toBe(e.verdict);
      expect(!!en.link, e.id).toBe(!!e.link);
      expect(!!en.attachment, e.id).toBe(!!e.attachment);
      expect(en.body.length, e.id).toBe(e.body.length);
    }
  });
});
