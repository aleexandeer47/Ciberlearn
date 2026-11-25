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

type L = { es: string; en: string };

export const FEATURES: { label: L; free: boolean | L; pro: boolean | L }[] = [
  // Se comprueba en content.test.ts (no se importa content.ts aquí: este archivo también va al navegador)
  { label: { es: "Ruta guiada: 24 lecciones, 126 ejercicios", en: "Guided path: 24 lessons, 126 exercises" }, free: true, pro: true },
  { label: { es: "Vidas en la ruta", en: "Lives on the path" }, free: { es: "5 (1 cada 30 min)", en: "5 (1 every 30 min)" }, pro: { es: "infinitas", en: "unlimited" } },
  { label: { es: "Chats con IA que intentan estafarte", en: "AI chats that try to scam you" }, free: false, pro: { es: "próximamente", en: "coming soon" } },
  { label: { es: "¿Es estafa? Revisa un mensaje con IA", en: "Is it a scam? Check a message with AI" }, free: false, pro: { es: "próximamente", en: "coming soon" } },
  { label: { es: "Llamadas simuladas (vishing) con voz", en: "Simulated voice calls (vishing)" }, free: { es: "1 por día", en: "1 a day" }, pro: { es: "todas", en: "all" } },
  { label: { es: "Ranking mundial y XP", en: "Global leaderboard and XP" }, free: true, pro: true },
  { label: { es: "Simulador clásico (10 mensajes)", en: "Classic simulator (10 messages)" }, free: true, pro: true },
  { label: { es: "Skills por tipo de señal e insignias", en: "Skills by sign type and badges" }, free: true, pro: true },
  { label: { es: "Bandeja de entrenamiento (correo simulado)", en: "Training inbox (simulated email)" }, free: false, pro: true },
  { label: { es: "Pack de mensajes avanzados", en: "Advanced message pack" }, free: false, pro: { es: "6 extra", en: "6 extra" } },
  { label: { es: "Modo contrarreloj", en: "Time trial mode" }, free: false, pro: true },
  { label: { es: "Entrenamiento de tu skill más débil", en: "Training for your weakest skill" }, free: false, pro: true },
  { label: { es: "Historial completo y evolución", en: "Full history and progress" }, free: { es: "últimas 3", en: "last 3" }, pro: { es: "todo", en: "everything" } },
  { label: { es: "Certificado de finalización", en: "Certificate of completion" }, free: false, pro: true },
];

export function isProActive(proUntil: Date | null | undefined, now = new Date()) {
  return !!proUntil && proUntil.getTime() > now.getTime();
}

/** Suma días al periodo vigente (si aún está activo) o desde hoy. */
export function extendPro(proUntil: Date | null | undefined, days: number, now = new Date()) {
  const base = isProActive(proUntil, now) ? proUntil!.getTime() : now.getTime();
  return new Date(base + days * 24 * 60 * 60 * 1000);
}
