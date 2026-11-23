import { describe, expect, it } from "vitest";
import { CONSENT_FIELD, consentError, LEGAL, readConsent } from "./legal";

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};

describe("consentimiento", () => {
  it("exige las dos casillas por separado", () => {
    expect(consentError(readConsent(form({})))).toMatch(/Términos.*Privacidad/i);
    expect(consentError(readConsent(form({ [CONSENT_FIELD.privacidad]: "si" })))).toMatch(/Términos/);
    expect(consentError(readConsent(form({ [CONSENT_FIELD.terminos]: "si" })))).toMatch(/privacidad/i);
    expect(
      consentError(readConsent(form({ [CONSENT_FIELD.terminos]: "si", [CONSENT_FIELD.privacidad]: "si" }))),
    ).toBeNull();
  });

  it("también en inglés", () => {
    expect(consentError({ terminos: false, privacidad: false }, "en")).toMatch(/Terms.*Privacy/);
    expect(consentError({ terminos: true, privacidad: false }, "en")).toBe("To continue, accept the Privacy policy.");
  });

  it("solo cuenta el valor exacto de la casilla", () => {
    const c = readConsent(form({ [CONSENT_FIELD.terminos]: "on", [CONSENT_FIELD.privacidad]: "" }));
    expect(c).toEqual({ terminos: false, privacidad: false });
  });

  it("cada documento tiene ruta y versión con fecha", () => {
    for (const d of Object.values(LEGAL)) {
      expect(d.path).toMatch(/^\/[a-z]+$/);
      expect(d.version).toMatch(/^\d{4}-\d{2}-\d{2}(\.\d+)?$/);
    }
  });
});
