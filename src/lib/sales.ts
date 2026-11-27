// Apertura de ventas: hasta esta fecha nadie puede pagar (Pro, Familia ni Empresa).
// Se comprueba en el servidor (src/lib/server/billing.ts y las acciones de compra) y se anuncia en pantalla.
// Para abrir antes o después, cambia solo esta fecha.

import type { Lang } from "./i18n";

/** 4 de diciembre de 2026, 00:00 hora de El Salvador (UTC-6). */
export const SALES_OPEN_AT = new Date("2026-12-04T00:00:00-06:00");

export const salesOpen = (now = new Date()) => now.getTime() >= SALES_OPEN_AT.getTime();

/** Días que faltan para abrir (redondeado hacia arriba); 0 si ya abrió. */
export const daysUntilSales = (now = new Date()) => Math.max(0, Math.ceil((SALES_OPEN_AT.getTime() - now.getTime()) / 864e5));

/** "4 de diciembre" / "December 4", en hora de El Salvador. */
export const salesOpenLabel = (lang: Lang) =>
  SALES_OPEN_AT.toLocaleDateString(lang === "en" ? "en-US" : "es-SV", { day: "numeric", month: "long", timeZone: "America/El_Salvador" });

/**
 * Descuento de lanzamiento: el día de apertura (4 de diciembre, hora de El Salvador), las cuentas con al menos
 * 800 XP pagan la mitad en todos los planes (Pro, Familia y Empresa). Se aplica en el servidor al crear la orden.
 */
export const LAUNCH_DISCOUNT = {
  percent: 50,
  minXp: 800,
  from: SALES_OPEN_AT,
  /** Fin exclusivo: 5 de diciembre de 2026, 00:00 hora de El Salvador */
  until: new Date("2026-12-05T00:00:00-06:00"),
} as const;

export const launchDiscountActive = (now = new Date()) =>
  now.getTime() >= LAUNCH_DISCOUNT.from.getTime() && now.getTime() < LAUNCH_DISCOUNT.until.getTime();

/** ¿Esta cuenta (con este XP) tiene el descuento ahora? */
export const hasLaunchDiscount = (xp: number | null | undefined, now = new Date()) =>
  launchDiscountActive(now) && (xp ?? 0) >= LAUNCH_DISCOUNT.minXp;

/** Precio con el descuento, redondeado a centavos (mínimo US$1). */
export const withLaunchDiscount = (amount: number) =>
  Math.max(1, Math.round(amount * (100 - LAUNCH_DISCOUNT.percent)) / 100);

/** Aviso que se muestra cuando alguien intenta pagar antes de tiempo. */
export const salesClosedMessage = (lang: Lang, now = new Date()) => {
  const d = daysUntilSales(now);
  const day = salesOpenLabel(lang);
  return lang === "en"
    ? `Purchases open on ${day} (in ${d} day${d === 1 ? "" : "s"}). Until then, everything free is open to you.`
    : `Las compras abren el ${day} (en ${d} día${d === 1 ? "" : "s"}). Mientras tanto, todo lo gratis ya está abierto.`;
};
