import { describe, expect, it } from "vitest";
import { FAMILY } from "./business";
import { classConsentText, orgConsentText } from "./legal";
import { isValidClassName, newClassCode, normalizeClassCode, SCHOOL } from "./school";

describe("modo colegio", () => {
  it("genera códigos de 6 caracteres sin letras ni números confundibles", () => {
    for (let i = 0; i < 200; i++) {
      const c = newClassCode();
      expect(c).toHaveLength(SCHOOL.codeLength);
      expect(c).not.toMatch(/[01OILS5]/);
    }
  });

  it("acepta el código escrito en minúsculas, con espacios o guiones", () => {
    expect(normalizeClassCode(" abc-dekm ")).toBeNull(); // 7 caracteres
    expect(normalizeClassCode("ab cd ef")).toBe("ABCDEF");
    expect(normalizeClassCode("ab-cd-ef")).toBe("ABCDEF");
    expect(normalizeClassCode("ABCDE0")).toBeNull(); // el 0 nunca está en un código
    expect(normalizeClassCode("")).toBeNull();
  });

  it("valida el nombre de la clase", () => {
    expect(isValidClassName("9.º B")).toBe(true);
    expect(isValidClassName(" a ")).toBe(false);
  });
});

describe("autorizaciones de familia y clase", () => {
  it("cada texto dice qué se comparte y con quién", () => {
    expect(orgConsentText("Familia Pérez", "familia")).toMatch(/Familia Pérez/);
    expect(orgConsentText("Familia Pérez", "familia")).not.toMatch(/simulacros/);
    expect(orgConsentText("Acme")).toMatch(/simulacros/);
    expect(classConsentText("9.º B")).toMatch(/docente.*9\.º B/);
  });

  it("el plan familiar sale más barato por persona que Pro anual", () => {
    expect(FAMILY.price / FAMILY.seats).toBeLessThan(29.99);
  });
});
