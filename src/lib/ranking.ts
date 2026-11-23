// Perfil público del ranking. Nunca se muestran el nombre real ni el correo.

import type { Lang } from "./i18n";

/** Países que se pueden elegir (código ISO). "OT" = otro país. Los nombres salen en el idioma de la página. */
export const COUNTRY_CODES = [
  // América Latina y el Caribe
  "AR", "BO", "BR", "CL", "CO", "CR", "CU", "DO", "EC", "GT", "HN", "MX", "NI", "PA", "PE", "PR", "PY", "SV", "UY", "VE",
  // Norteamérica y Caribe de habla inglesa
  "US", "CA", "JM", "TT", "BS", "BZ",
  // Europa
  "ES", "GB", "IE", "PT", "FR", "DE", "IT", "NL", "BE", "CH", "AT", "SE", "NO", "DK", "FI", "PL", "RO", "GR",
  // África, Asia y Oceanía
  "ZA", "NG", "KE", "GH", "EG", "MA", "IN", "PK", "PH", "SG", "MY", "ID", "JP", "KR", "CN", "AE", "SA", "IL", "TR", "AU", "NZ",
] as const;
const VALID = new Set<string>([...COUNTRY_CODES, "OT"]);
export const isCountry = (v: string) => VALID.has(v);

/** Nombre del país en el idioma pedido. */
export function countryName(code: string, lang: Lang) {
  if (code === "OT") return lang === "en" ? "Other country" : "Otro país";
  try {
    return new Intl.DisplayNames([lang], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Lista para el selector, ordenada por nombre y con "Otro país" al final. */
export function countryOptions(lang: Lang): [string, string][] {
  const list = COUNTRY_CODES.map((c) => [c, countryName(c, lang)] as [string, string]).sort((x, y) => x[1].localeCompare(y[1], lang));
  return [...list, ["OT", countryName("OT", lang)]];
}

export const NICK_RE = /^[\p{L}\p{N}_.-]{3,20}$/u;

/** Apodo por defecto, estable y sin datos personales: "Detective-4F2A". */
export function defaultNickname(userId: string) {
  return `Detective-${userId.slice(-4).toUpperCase()}`;
}

export function publicName(u: { _id: { toHexString(): string }; nickname?: string }) {
  return u.nickname || defaultNickname(u._id.toHexString());
}

/** Lunes 00:00 de la semana actual en El Salvador (UTC-6, sin horario de verano). */
export function weekStart(now = new Date()) {
  const sv = new Date(now.getTime() - 6 * 3600_000); // hora de El Salvador como si fuera UTC
  const dow = (sv.getUTCDay() + 6) % 7; // 0 = lunes
  const monday = Date.UTC(sv.getUTCFullYear(), sv.getUTCMonth(), sv.getUTCDate() - dow);
  return new Date(monday + 6 * 3600_000);
}
