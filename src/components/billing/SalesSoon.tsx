"use client";

import { CalendarClock, Gift } from "lucide-react";
import { io } from "next/cache";
import { use } from "react";
import { useLang, useT } from "@/components/i18n/LangProvider";
import { daysUntilSales, LAUNCH_DISCOUNT, launchDiscountActive, salesOpen, salesOpenLabel } from "@/lib/sales";

/** La hora actual, leída por petición (Cache Components no deja leerla al prerenderizar sin io()). */
function useNow() {
  use(io());
  return new Date();
}

/** ¿Ya se puede comprar? (la fecha está en src/lib/sales.ts; el servidor lo vuelve a comprobar). */
export function useSalesOpen() {
  return salesOpen(useNow());
}

/**
 * Antes de abrir: anuncia la fecha de apertura y el descuento de lanzamiento.
 * El día de apertura: recuerda el descuento. Después: no muestra nada.
 */
export function SalesSoon({ className = "" }: { className?: string }) {
  const lang = useLang();
  const t = useT();
  const now = useNow();
  const day = salesOpenLabel(lang);
  const { percent, minXp } = LAUNCH_DISCOUNT;
  const xp = minXp.toLocaleString("en-US");

  if (launchDiscountActive(now)) {
    return (
      <div role="status" className={`flex items-start gap-3 rounded-2xl border border-ok/40 bg-ok/10 px-4 py-3.5 text-left ${className}`}>
        <Gift className="mt-0.5 h-5 w-5 shrink-0 text-ok" strokeWidth={2} aria-hidden />
        <div className="text-sm">
          <p className="font-semibold">{t(`¡Solo hoy: ${percent}% de descuento en todos los planes!`, `Today only: ${percent}% off every plan!`)}</p>
          <p className="mt-0.5 opacity-80">
            {t(
              `Para cuentas con ${xp} XP o más. Se aplica solo al pagar.`,
              `For accounts with ${xp} XP or more. It's applied automatically at checkout.`,
            )}
          </p>
        </div>
      </div>
    );
  }
  if (salesOpen(now)) return null;

  const d = daysUntilSales(now);
  return (
    <div role="status" className={`flex items-start gap-3 rounded-2xl border border-brand/40 bg-brand/10 px-4 py-3.5 text-left ${className}`}>
      <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={2} aria-hidden />
      <div className="text-sm">
        <p className="font-semibold">
          {t(`¡Las compras abren el ${day}!`, `Purchases open on ${day}!`)}{" "}
          <span className="font-normal opacity-80">
            {t(`Faltan ${d} día${d === 1 ? "" : "s"}.`, `${d} day${d === 1 ? "" : "s"} to go.`)}
          </span>
        </p>
        <p className="mt-1.5 flex gap-1.5">
          <Gift className="mt-0.5 h-4 w-4 shrink-0 text-ok" strokeWidth={2} aria-hidden />
          <span>
            <strong>
              {t(`Ese día, ${percent}% de descuento en todos los planes`, `That day, ${percent}% off every plan`)}
            </strong>{" "}
            {t(
              `para las cuentas registradas con al menos ${xp} XP. ¡Empieza a sumar XP desde hoy!`,
              `for registered accounts with at least ${xp} XP. Start earning XP today!`,
            )}
          </span>
        </p>
        <p className="mt-1.5 opacity-80">
          {t("Mientras tanto puedes usar gratis todo lo demás: la ruta, el simulador, la estafa del día y más.", "Until then, everything else is free to use: the path, the simulator, the scam of the day and more.")}
        </p>
      </div>
    </div>
  );
}

/** Texto del botón de pago mientras las ventas están cerradas. */
export function useClosedLabel() {
  const lang = useLang();
  const t = useT();
  return t(`Disponible el ${salesOpenLabel(lang)}`, `Available on ${salesOpenLabel(lang)}`);
}
