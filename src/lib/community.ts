// Retos entre amigos y alertas de la comunidad. Funciones puras (se prueban sin base de datos).

import type { Lang } from "./i18n";

export const CHALLENGE_SIZE = 5;

/** Nombre visible en un reto: letras, números, espacios y . _ - (2 a 20). */
export const PLAYER_NAME_RE = /^[\p{L}\p{N} _.-]{2,20}$/u;

export function cleanPlayerName(raw: unknown) {
  const s = String(raw ?? "").trim().replace(/\s+/g, " ");
  return PLAYER_NAME_RE.test(s) ? s : null;
}

/** Elige `n` elementos distintos al azar. `rand` se puede inyectar para pruebas. */
export function pickRandom<T>(items: readonly T[], n: number, rand = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export function challengeOutcome(mine: number, theirs: number | null) {
  if (theirs === null) return null;
  return mine > theirs ? "ganaste" : mine === theirs ? "empate" : "perdiste";
}

// ---------------------------------------------------------------------------------- alertas

export const REPORT_CHANNELS = ["SMS", "WhatsApp", "Correo", "Llamada", "Redes sociales", "Otro"] as const;
export type ReportChannel = (typeof REPORT_CHANNELS)[number];
export const isReportChannel = (v: unknown): v is ReportChannel => REPORT_CHANNELS.includes(v as ReportChannel);
/** Nombre del canal en cada idioma (se guarda la clave en español). */
export const REPORT_CHANNEL_LABEL: Record<Lang, Record<ReportChannel, string>> = {
  es: { SMS: "SMS", WhatsApp: "WhatsApp", Correo: "Correo", Llamada: "Llamada", "Redes sociales": "Redes sociales", Otro: "Otro" },
  en: { SMS: "Text (SMS)", WhatsApp: "WhatsApp", Correo: "Email", Llamada: "Phone call", "Redes sociales": "Social media", Otro: "Other" },
};

export const REPORT_LIMITS = { textMin: 15, textMax: 1000, senderMax: 120, perDay: 3 } as const;

/**
 * "Desactiva" enlaces y dominios para mostrarlos sin que nadie pueda tocarlos por error:
 * http → hxxp y los puntos de un dominio → [.]  (práctica habitual al publicar indicadores de estafa).
 */
export function defang(text: string) {
  return text
    .replace(/\bhttp(s?):\/\//gi, (_m, s) => `hxxp${s}://`)
    .replace(/\b((?:[a-z0-9-]+\.)+[a-z]{2,})\b/gi, (m) => (/^\d+(\.\d+)*$/.test(m) ? m : m.replace(/\./g, "[.]")));
}

/** Quita caracteres de control y espacios repetidos de lo que escribe el usuario. */
export function cleanReportText(raw: unknown, max: number) {
  return String(raw ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}
