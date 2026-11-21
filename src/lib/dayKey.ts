// Fechas por día en la hora de El Salvador (UTC-6, sin horario de verano).
export const TZ = "America/El_Salvador";

/** "2026-11-20" según el calendario de El Salvador. */
export function dayKey(d: Date = new Date()) {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Los últimos `n` días, del más antiguo al de hoy. */
export function lastDays(n: number, now: Date = new Date()) {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(dayKey(new Date(now.getTime() - i * 864e5)));
  return out;
}
