"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { checkout } from "@/app/actions/billing";
import { useT } from "@/components/i18n/LangProvider";
import { ConsentChecks } from "@/components/legal/ConsentChecks";
import { SalesSoon, useClosedLabel, useSalesOpen } from "./SalesSoon";
import type { T } from "@/lib/i18n";
import { BUSINESS, FAMILY } from "@/lib/business";
import { LEGAL, RETRACT_DAYS } from "@/lib/legal";
import { PLANS, type PlanId } from "@/lib/plans";
import { LAUNCH_DISCOUNT, withLaunchDiscount } from "@/lib/sales";

const perks = (t: T) => ({
  pro: [
    t("Vidas infinitas en la ruta guiada", "Unlimited lives on the guided path"),
    t("Bandeja de entrenamiento: un día de correo simulado", "Training inbox: a simulated day of email"),
    t("Todas las llamadas simuladas con voz", "Every simulated voice call"),
    t("Chats con la IA estafadora y “¿Es estafa?” (próximamente)", "AI scammer chats and “Is it a scam?” (coming soon)"),
    t("6 mensajes avanzados, contrarreloj y entrenamiento", "6 advanced messages, time trial and training"),
    t("Historial completo y certificado", "Full history and certificate"),
  ],
  business: [
    t("Todo lo de Pro para cada persona", "Everything in Pro for each person"),
    t("Panel del encargado e índice de preparación", "Manager dashboard and readiness score"),
    t("Simulacros de phishing y botón para reportar", "Phishing drills and a report button"),
    t("Rutas por área (finanzas, atención, gerencia…)", "Paths by team (finance, support, management…)"),
    t("Informe para gerencia en PDF", "PDF report for management"),
  ],
  free: [t("Ruta guiada con 5 vidas", "Guided path with 5 lives"), t("Ranking mundial, XP e insignias", "Global leaderboard, XP and badges"), t("Simulador clásico", "Classic simulator")],
});

function PayButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const t = useT();
  const open = useSalesOpen();
  const closedLabel = useClosedLabel();
  return (
    <button type="submit" disabled={pending || !open} className="btn btn-primary w-full px-6 py-3.5 disabled:opacity-60">
      {!open ? closedLabel : pending ? t("Preparando el pago…", "Preparing payment…") : label}
    </button>
  );
}

/** `discount`: la cuenta tiene hoy el descuento de lanzamiento (lo calcula el servidor; el cobro también). */
export function PlanPicker({ proUntil, discount = false }: { proUntil: string | null; discount?: boolean }) {
  const [period, setPeriod] = useState<PlanId>("pro-anual");
  const plan = PLANS[period];
  const monthly = PLANS["pro-mensual"];
  const error = useSearchParams().get("error");
  const active = proUntil && new Date(proUntil) > new Date();
  const t = useT();
  const P = perks(t);
  const per = (id: PlanId) => (id === "pro-anual" ? t("año", "year") : t("mes", "month"));

  return (
    <div>
      <SalesSoon className="mx-auto mb-6 max-w-xl" />
      {error && (
        <p role="alert" className="mx-auto mb-6 max-w-xl rounded-xl bg-bad/15 px-4 py-3 text-center text-sm text-bad-text">
          {error}
        </p>
      )}

      <div className="mx-auto mb-10 flex w-max rounded-full border border-desk-line bg-desk-2 p-1" role="radiogroup" aria-label={t("Periodo de pago", "Billing period")}>
        {(["pro-mensual", "pro-anual"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={period === id}
            onClick={() => setPeriod(id)}
            className={`btn px-5 py-2 text-sm ${period === id ? "bg-brand text-white" : "text-fog hover:text-chalk"}`}
          >
            {id === "pro-mensual" ? t("Mensual", "Monthly") : t("Anual", "Yearly")}
            {id === "pro-anual" && <span className="rounded-full bg-ok px-1.5 py-0.5 text-[10px] text-white">-37%</span>}
          </button>
        ))}
      </div>

      <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2 lg:max-w-6xl lg:grid-cols-3">
        <div className="flex flex-col rounded-3xl border border-desk-line bg-desk-2 p-7">
          <h2 className="font-display text-xl font-semibold">{t("Gratis", "Free")}</h2>
          <p className="mt-1 text-sm text-fog">{t("Para empezar a entrenar el ojo.", "To start training your eye.")}</p>
          <p className="mt-6 font-display text-5xl font-semibold">$0</p>
          <ul className="mt-6 flex-1 space-y-2.5 text-sm">
            {P.free.map((p) => (
              <li key={p} className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-fog" strokeWidth={2} aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/registro" className="btn btn-ghost mt-8 w-full px-6 py-3.5">
            {t("Crear cuenta gratis", "Sign up free")}
          </Link>
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-3xl bg-paper p-7 text-ink ring-2 ring-brand shadow-[0_30px_60px_-30px_var(--brand)]">
          <span className="absolute right-6 top-6 -rotate-6 rounded-lg border-[3px] border-double border-brand-dark px-2 py-0.5 font-display text-xs font-bold uppercase text-brand-dark">
            {t("Recomendado", "Recommended")}
          </span>
          <h2 className="font-display text-xl font-semibold">Pro</h2>
          <p className="mt-1 text-sm text-ink-2">{t("Para quien quiere no caer nunca.", "For anyone who never wants to fall for it.")}</p>
          <p key={period} className="pop-in mt-6 flex items-end gap-1">
            {discount && <span className="pb-1.5 pr-1 text-xl text-ink-3 line-through">${plan.price}</span>}
            <span className="font-display text-5xl font-semibold">${discount ? withLaunchDiscount(plan.price).toFixed(2) : plan.price}</span>
            <span className="pb-1.5 text-ink-2">/{per(period)}</span>
          </p>
          <p className="mt-1 h-5 text-sm text-ok">
            {discount
              ? t(`¡Tienes ${LAUNCH_DISCOUNT.percent}% de descuento de lanzamiento!`, `You get a ${LAUNCH_DISCOUNT.percent}% launch discount!`)
              : period === "pro-anual" &&
              t(
                `Equivale a $${(plan.price / 12).toFixed(2)} al mes en vez de $${monthly.price}`,
                `That's $${(plan.price / 12).toFixed(2)} a month instead of $${monthly.price}`,
              )}
          </p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {P.pro.map((p) => (
              <li key={p} className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <form action={checkout} className="mt-8 space-y-4">
            <input type="hidden" name="plan" value={period} />
            <ConsentChecks tone="paper" />
            <PayButton
              label={
                active
                  ? t(`Extender Pro (${plan.days} días más)`, `Extend Pro (${plan.days} more days)`)
                  : period === "pro-anual"
                    ? t("Obtener Pro anual", "Get Pro yearly")
                    : t("Obtener Pro mensual", "Get Pro monthly")
              }
            />
          </form>
          <Link href="/familia" className="mt-4 block rounded-xl bg-paper-2 px-4 py-2.5 text-center text-sm font-medium text-ink-2 hover:text-ink">
            {t("¿Para tu familia?", "For your family?")}{" "}
            <strong className="text-brand">
              {t(
                `Pro Familiar: ${FAMILY.seats} personas por $${FAMILY.price}/año →`,
                `Family plan: ${FAMILY.seats} people for $${FAMILY.price}/year →`,
              )}
            </strong>
          </Link>
          <p className="mt-3 text-center text-xs text-ink-3">
            {t(
              `Pago único con tarjeta por medio de Wompi. Sin cobros automáticos. Tienes ${RETRACT_DAYS} días para`,
              `One-time card payment through Wompi. No automatic charges. You have ${RETRACT_DAYS} days to`,
            )}{" "}
            <Link href={LEGAL.reembolsos.path} className="underline underline-offset-2">
              {t("pedir tu reembolso", "request a refund")}
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col rounded-3xl border border-desk-line bg-desk-2 p-7 md:col-span-2 lg:col-span-1">
          <h2 className="font-display text-xl font-semibold">{t("Empresa", "Business")}</h2>
          <p className="mt-1 text-sm text-fog">{t("Para entrenar a todo tu equipo.", "To train your whole team.")}</p>
          <p className="mt-6 flex items-end gap-1">
            <span className="font-display text-5xl font-semibold">${BUSINESS.seatPrice}</span>
            <span className="pb-1.5 text-fog">{t("/persona al año", "/person per year")}</span>
          </p>
          <p className="mt-1 h-5 text-sm text-fog">{t(`Desde ${BUSINESS.minSeats} personas`, `From ${BUSINESS.minSeats} people`)}</p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {P.business.map((p) => (
              <li key={p} className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/empresa" className="btn btn-dark mt-8 w-full px-6 py-3.5">
            {t("Ver plan Empresa", "See Business plan")}
          </Link>
        </div>
      </div>
    </div>
  );
}
