// Perfil público del ranking. Nunca se muestran el nombre real ni el correo.

export const COUNTRIES: Record<string, string> = {
  SV: "El Salvador",
  GT: "Guatemala",
  HN: "Honduras",
  NI: "Nicaragua",
  CR: "Costa Rica",
  PA: "Panamá",
  MX: "México",
  US: "Estados Unidos",
  CO: "Colombia",
  DO: "República Dominicana",
  PR: "Puerto Rico",
  CU: "Cuba",
  VE: "Venezuela",
  EC: "Ecuador",
  PE: "Perú",
  BO: "Bolivia",
  CL: "Chile",
  AR: "Argentina",
  UY: "Uruguay",
  PY: "Paraguay",
  ES: "España",
  OT: "Otro país",
};

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
