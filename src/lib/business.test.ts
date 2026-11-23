import { describe, expect, it } from "vitest";
import { addSeatsPrice, BUSINESS, daysLeft, isValidSeats, orgActive, parseEmails, pct, PHISH_TEMPLATES, yearPrice } from "./business";

const now = new Date("2026-11-21T12:00:00Z");
const inDays = (n: number) => new Date(now.getTime() + n * 864e5);

describe("precios del plan Empresa", () => {
  it("cobra por empleado al año con un mínimo de puestos", () => {
    expect(yearPrice(5)).toBe(120);
    expect(yearPrice(37)).toBe(888);
    expect(isValidSeats(BUSINESS.minSeats)).toBe(true);
    expect(isValidSeats(4)).toBe(false);
    expect(isValidSeats(5.5)).toBe(false);
    expect(isValidSeats(BUSINESS.maxSeats + 1)).toBe(false);
  });

  it("agregar puestos cuesta la parte proporcional de lo que falta del año", () => {
    expect(addSeatsPrice(10, inDays(365), now)).toBe(240);
    expect(addSeatsPrice(10, inDays(182.5), now)).toBe(120.33); // 10 × 24 × 183/365, redondeado hacia arriba
    expect(addSeatsPrice(1, inDays(2), now)).toBe(1); // mínimo US$1
    expect(addSeatsPrice(5, inDays(-1), now)).toBe(0); // vencido: hay que renovar
    expect(addSeatsPrice(5, null, now)).toBe(0);
  });

  it("calcula días restantes y si el plan está activo", () => {
    expect(daysLeft(inDays(0.2), now)).toBe(1);
    expect(daysLeft(inDays(-3), now)).toBe(0);
    expect(orgActive(inDays(1), now)).toBe(true);
    expect(orgActive(inDays(-1), now)).toBe(false);
    expect(orgActive(null, now)).toBe(false);
  });
});

describe("invitaciones y simulacros", () => {
  it("separa correos válidos, quita repetidos y respeta el límite", () => {
    const r = parseEmails("Ana@empresa.com, ana@empresa.com\nluis@empresa.com.sv; malo@ x@y", 2);
    expect(r.valid).toEqual(["ana@empresa.com", "luis@empresa.com.sv"]);
    expect(r.invalid).toContain("malo@");
    expect(parseEmails("a@b.co c@d.co e@f.co", 2).overLimit).toBe(true);
  });

  it("cada plantilla tiene id único, contenido y señales para enseñar", () => {
    expect(new Set(PHISH_TEMPLATES.map((t) => t.id)).size).toBe(PHISH_TEMPLATES.length);
    for (const t of PHISH_TEMPLATES) {
      expect(t.subject("Acme").length).toBeGreaterThan(5);
      expect(t.body("Acme", "Ana").join(" ")).toContain("Ana");
      expect(t.signals.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("porcentajes sin dividir entre cero", () => {
    expect(pct(1, 3)).toBe(33);
    expect(pct(0, 0)).toBe(0);
  });
});

import { phishTemplate as tpl, PHISH_TEMPLATES as ES_T } from "./business";

describe("simulacros en inglés", () => {
  it("cada plantilla tiene su versión en inglés con la misma forma", () => {
    for (const es of ES_T) {
      const en = tpl(es.id, "en");
      expect(en, es.id).toBeDefined();
      expect(en!.difficulty).toBe(es.difficulty);
      expect(en!.signals.length).toBe(es.signals.length);
      expect(en!.subject("Acme")).not.toBe(es.subject("Acme"));
    }
  });
});
