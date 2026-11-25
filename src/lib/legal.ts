// Documentos legales del sitio. Cada vez que cambies el texto de uno, cambia su `version`
// y su `updated`: las aceptaciones guardadas en la colección `consents` llevan la versión,
// así se sabe exactamente qué texto aceptó cada persona (y en qué idioma: se guarda el texto).

import type { Lang } from "@/lib/i18n";
import { SITE } from "@/lib/site";

type L = Record<Lang, string>;

// Formato de versión: AAAA-MM-DD, con ".2", ".3"… si cambia más de una vez el mismo día.
export const LEGAL = {
  terminos: {
    path: "/terminos",
    title: { es: "Términos y condiciones", en: "Terms and conditions" } as L,
    version: "2026-11-22.3",
    updated: { es: "22 de noviembre de 2026", en: "November 22, 2026" } as L,
  },
  privacidad: {
    path: "/privacidad",
    title: { es: "Política de privacidad", en: "Privacy policy" } as L,
    version: "2026-11-25",
    updated: { es: "25 de noviembre de 2026", en: "November 25, 2026" } as L,
  },
  cookies: {
    path: "/cookies",
    title: { es: "Política de cookies", en: "Cookie policy" } as L,
    version: "2026-11-22.3",
    updated: { es: "22 de noviembre de 2026", en: "November 22, 2026" } as L,
  },
  reembolsos: {
    path: "/reembolsos",
    title: { es: "Política de reembolso", en: "Refund policy" } as L,
    version: "2026-11-22.2",
    updated: { es: "22 de noviembre de 2026", en: "November 22, 2026" } as L,
  },
} as const;

/** Casilla que marca un empleado al unirse a una empresa. Se guarda con la versión de la privacidad. */
export const ORG_CONSENT_FIELD = "acepta_empresa";
export const orgConsentText = (org: string, kind: "empresa" | "familia" = "empresa", lang: Lang = "es") =>
  kind === "familia"
    ? lang === "en"
      ? `I allow whoever manages the ${org} plan to see my progress on ${SITE.name} (name, email, lessons, XP and streak).`
      : `Autorizo a quien administra el plan de ${org} a ver mi avance en ${SITE.name} (nombre, correo, lecciones, XP y racha).`
    : lang === "en"
      ? `I allow ${org} to see my progress on ${SITE.name} (name, email, lessons, scores and phishing drill results) and to send me phishing drills for training purposes.`
      : `Autorizo a ${org} a ver mi avance en ${SITE.name} (nombre, correo, lecciones, puntajes y resultados de simulacros) y a enviarme simulacros de phishing con fines de capacitación.`;

export const CLASS_CONSENT_FIELD = "acepta_clase";

/** Casilla que marca un estudiante al unirse a una clase (texto exacto que ve). */
export const CLASS_CONSENT_LABEL: L = {
  es: "Autorizo a mi docente de esta clase a ver mi perfil: nombre, nivel, XP, racha, lecciones, habilidades, insignias y mis rondas del simulador. Puedo salir cuando quiera.",
  en: "I allow the teacher of this class to see my profile: name, level, XP, streak, lessons, skills, badges and my simulator rounds. I can leave whenever I want.",
};
/** Lo que se guarda: el texto de la casilla y a qué clase se refiere. */
export const classConsentText = (clase: string, lang: Lang = "es") =>
  `${CLASS_CONSENT_LABEL[lang]} ${lang === "en" ? "Class" : "Clase"}: “${clase}”.`;

/** Documentos que la persona acepta de forma expresa, cada uno con su propia casilla. */
export type ConsentDocument = "terminos" | "privacidad";

/** Texto exacto de cada casilla. Se guarda junto con la aceptación. */
export const CONSENT_TEXT: Record<ConsentDocument, L> = {
  terminos: {
    es: "He leído y acepto los Términos y condiciones, incluida la Política de reembolso.",
    en: "I have read and accept the Terms and conditions, including the Refund policy.",
  },
  privacidad: {
    es: "He leído y acepto la Política de privacidad y el tratamiento de mis datos personales que ahí se describe.",
    en: "I have read and accept the Privacy policy and the processing of my personal data described there.",
  },
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
export function consentError(c: { terminos: boolean; privacidad: boolean }, lang: Lang = "es") {
  const en = lang === "en";
  if (!c.terminos && !c.privacidad)
    return en
      ? "To continue, accept the Terms and conditions and the Privacy policy."
      : "Para continuar, acepta los Términos y condiciones y la Política de privacidad.";
  if (!c.terminos) return en ? "To continue, accept the Terms and conditions." : "Para continuar, acepta los Términos y condiciones.";
  if (!c.privacidad) return en ? "To continue, accept the Privacy policy." : "Para continuar, acepta la Política de privacidad.";
  return null;
}

export const RETRACT_DAYS = 8;
export const REFUND_DAYS = 15;
