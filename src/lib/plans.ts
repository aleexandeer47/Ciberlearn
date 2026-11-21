// Catálogo de planes: compartido entre cliente y servidor. Los precios están en USD.

export type PlanId = "pro-mensual" | "pro-anual";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  days: number;
  period: string;
  note?: string;
}

export const PLANS: Record<PlanId, Plan> = {
  "pro-mensual": { id: "pro-mensual", name: "Pro mensual", price: 3.99, days: 30, period: "mes" },
  "pro-anual": { id: "pro-anual", name: "Pro anual", price: 29.99, days: 365, period: "año", note: "Ahorras 37%" },
};

export const isPlanId = (v: unknown): v is PlanId => typeof v === "string" && v in PLANS;

export const FEATURES: { label: string; free: boolean | string; pro: boolean | string }[] = [
  { label: "Ruta guiada: 12 lecciones, 48 ejercicios", free: true, pro: true },
  { label: "Vidas en la ruta", free: "5 (1 cada 30 min)", pro: "infinitas" },
  { label: "Chats con IA que intentan estafarte", free: false, pro: "próximamente" },
  { label: "Ranking mundial y XP", free: true, pro: true },
  { label: "Simulador clásico (10 mensajes)", free: true, pro: true },
  { label: "Skills por tipo de señal e insignias", free: true, pro: true },
  { label: "Pack de mensajes avanzados", free: false, pro: "6 extra" },
  { label: "Modo contrarreloj", free: false, pro: true },
  { label: "Entrenamiento de tu skill más débil", free: false, pro: true },
  { label: "Historial completo y evolución", free: "últimas 3", pro: "todo" },
  { label: "Certificado de finalización", free: false, pro: true },
];

export function isProActive(proUntil: Date | null | undefined, now = new Date()) {
  return !!proUntil && proUntil.getTime() > now.getTime();
}

/** Suma días al periodo vigente (si aún está activo) o desde hoy. */
export function extendPro(proUntil: Date | null | undefined, days: number, now = new Date()) {
  const base = isProActive(proUntil, now) ? proUntil!.getTime() : now.getTime();
  return new Date(base + days * 24 * 60 * 60 * 1000);
}
