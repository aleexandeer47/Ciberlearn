// Documentos legales del sitio. Cada vez que cambies el texto de uno, cambia su `version`
// y su `updated`: las aceptaciones guardadas en la colección `consents` llevan la versión,
// así se sabe exactamente qué texto aceptó cada persona.

export const LEGAL = {
  terminos: { path: "/terminos", title: "Términos y condiciones", version: "2026-11-21", updated: "21 de noviembre de 2026" },
  privacidad: { path: "/privacidad", title: "Política de privacidad", version: "2026-11-21", updated: "21 de noviembre de 2026" },
  cookies: { path: "/cookies", title: "Política de cookies", version: "2026-11-21", updated: "21 de noviembre de 2026" },
  reembolsos: { path: "/reembolsos", title: "Política de reembolso", version: "2026-11-21", updated: "21 de noviembre de 2026" },
} as const;

/** Documentos que la persona acepta de forma expresa, cada uno con su propia casilla. */
export type ConsentDocument = "terminos" | "privacidad";

/** Texto exacto de cada casilla. Se guarda junto con la aceptación. */
export const CONSENT_TEXT: Record<ConsentDocument, string> = {
  terminos: "He leído y acepto los Términos y condiciones, incluida la Política de reembolso.",
  privacidad: "He leído y acepto la Política de privacidad y el tratamiento de mis datos personales que ahí se describe.",
};

/** Nombre del campo del formulario para cada casilla. */
export const CONSENT_FIELD: Record<ConsentDocument, string> = {
  terminos: "acepta_terminos",
  privacidad: "acepta_privacidad",
};

/** Qué casillas marcó la persona en el formulario. */
export function readConsent(form: FormData) {
  return {
    terminos: form.get(CONSENT_FIELD.terminos) === "si",
    privacidad: form.get(CONSENT_FIELD.privacidad) === "si",
  };
}

/** Mensaje de error si falta alguna casilla; null si están las dos. */
export function consentError(c: { terminos: boolean; privacidad: boolean }) {
  if (!c.terminos && !c.privacidad) return "Para continuar, acepta los Términos y condiciones y la Política de privacidad.";
  if (!c.terminos) return "Para continuar, acepta los Términos y condiciones.";
  if (!c.privacidad) return "Para continuar, acepta la Política de privacidad.";
  return null;
}

export const RETRACT_DAYS = 8;
export const REFUND_DAYS = 15;
