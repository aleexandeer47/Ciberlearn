import { describe, expect, it } from "vitest";
import { pickVoice } from "./voice";

const v = (name: string, lang: string, localService = true) => ({ name, lang, localService });

// Listas parecidas a las que dan los navegadores reales.
const CHROME_WINDOWS = [
  v("Microsoft David - English (United States)", "en-US"),
  v("Microsoft Zira - English (United States)", "en-US"),
  v("Microsoft Sabina - Spanish (Mexico)", "es-MX"),
  v("Google US English", "en-US", false),
  v("Google UK English Female", "en-GB", false),
  v("Google español", "es-ES", false),
  v("Google español de Estados Unidos", "es-US", false),
];
const EDGE = [
  v("Microsoft Helena - Spanish (Spain)", "es-ES"),
  v("Microsoft Dalia Online (Natural) - Spanish (Mexico)", "es-MX", false),
  v("Microsoft Aria Online (Natural) - English (United States)", "en-US", false),
  v("Microsoft Guy Online (Natural) - English (United States)", "en-US", false),
];
const MAC = [
  v("Eddy (Español (México))", "es-MX"),
  v("Paulina", "es-MX"),
  v("Mónica (Enhanced)", "es-ES"),
  v("Zarvox", "en-US"),
  v("Samantha", "en-US"),
];
const ONLY_ENGLISH = [v("Microsoft David - English (United States)", "en-US"), v("Google US English", "en-US", false)];

describe("pickVoice", () => {
  it("nunca elige una voz de otro idioma", () => {
    for (const list of [CHROME_WINDOWS, EDGE, MAC]) {
      expect(pickVoice(list, "es")?.lang.toLowerCase().startsWith("es")).toBe(true);
      expect(pickVoice(list, "en")?.lang.toLowerCase().startsWith("en")).toBe(true);
    }
  });

  it("sin voz en el idioma devuelve null (no lee español con voz en inglés)", () => {
    expect(pickVoice(ONLY_ENGLISH, "es")).toBeNull();
    expect(pickVoice([], "en")).toBeNull();
  });

  it("prefiere las voces naturales y en línea a las de escritorio", () => {
    expect(pickVoice(CHROME_WINDOWS, "es")?.name).toBe("Google español de Estados Unidos");
    expect(pickVoice(CHROME_WINDOWS, "en")?.name).toBe("Google US English");
    expect(pickVoice(EDGE, "es")?.name).toBe("Microsoft Dalia Online (Natural) - Spanish (Mexico)");
    expect(pickVoice(EDGE, "en")?.name).toMatch(/Online \(Natural\)/);
  });

  it("evita las voces robóticas o de novedad", () => {
    expect(pickVoice(MAC, "es")?.name).toBe("Mónica (Enhanced)");
    expect(pickVoice(MAC, "en")?.name).toBe("Samantha");
    expect(pickVoice([v("Eddy (Español (México))", "es-MX"), v("Paulina", "es-MX")], "es")?.name).toBe("Paulina");
  });

  it("acepta códigos con guion bajo (Android)", () => {
    expect(pickVoice([v("Español", "es_US"), v("English", "en_US")], "es")?.name).toBe("Español");
  });
});
