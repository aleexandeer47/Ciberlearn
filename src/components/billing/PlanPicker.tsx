"use client";

import { Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { checkout } from "@/app/actions/billing";
import { PLANS, type PlanId } from "@/lib/plans";

const PRO_PERKS = [
  "Vidas infinitas en la ruta guiada",
  "Chats con la IA estafadora (próximamente)",
  "6 mensajes avanzados, contrarreloj y entrenamiento",
  "Historial completo y evolución",
  "Certificado de finalización",
];
const FREE_PERKS = ["Ruta guiada con 5 vidas", "Ranking mundial, XP e insignias", "Simulador clásico"];

function PayButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full px-6 py-3.5 disabled:opacity-60">
      {pending ? "Preparando el pago…" : label}
    </button>
  );
}

export function PlanPicker({ proUntil }: { proUntil: string | null }) {
  const [period, setPeriod] = useState<PlanId>("pro-anual");
  const plan = PLANS[period];
  const monthly = PLANS["pro-mensual"];
  const error = useSearchParams().get("error");
  const active = proUntil && new Date(proUntil) > new Date();

  return (
    <div>
      {error && (
        <p role="alert" className="mx-auto mb-6 max-w-xl rounded-xl bg-bad/15 px-4 py-3 text-center text-sm text-bad-text">
          {error}
        </p>
      )}

      <div className="mx-auto mb-10 flex w-max rounded-full border border-desk-line bg-desk-2 p-1" role="radiogroup" aria-label="Periodo de pago">
        {(["pro-mensual", "pro-anual"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={period === id}
            onClick={() => setPeriod(id)}
            className={`btn px-5 py-2 text-sm ${period === id ? "bg-brand text-white" : "text-fog hover:text-chalk"}`}
          >
            {id === "pro-mensual" ? "Mensual" : "Anual"}
            {id === "pro-anual" && <span className="rounded-full bg-ok px-1.5 py-0.5 text-[10px] text-white">-37%</span>}
          </button>
        ))}
      </div>

      <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
        <div className="flex flex-col rounded-3xl border border-desk-line bg-desk-2 p-7">
          <h2 className="font-display text-xl font-semibold">Gratis</h2>
          <p className="mt-1 text-sm text-fog">Para empezar a entrenar el ojo.</p>
          <p className="mt-6 font-display text-5xl font-semibold">$0</p>
          <ul className="mt-6 flex-1 space-y-2.5 text-sm">
            {FREE_PERKS.map((p) => (
              <li key={p} className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-fog" strokeWidth={2} aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <a href="/registro" className="btn btn-ghost mt-8 w-full px-6 py-3.5">
            Crear cuenta gratis
          </a>
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-3xl bg-paper p-7 text-ink ring-2 ring-brand shadow-[0_30px_60px_-30px_var(--brand)]">
          <span className="absolute right-6 top-6 -rotate-6 rounded-lg border-[3px] border-double border-brand-dark px-2 py-0.5 font-display text-xs font-bold uppercase text-brand-dark">
            Recomendado
          </span>
          <h2 className="font-display text-xl font-semibold">Pro</h2>
          <p className="mt-1 text-sm text-ink-2">Para quien quiere no caer nunca.</p>
          <p key={period} className="pop-in mt-6 flex items-end gap-1">
            <span className="font-display text-5xl font-semibold">${plan.price}</span>
            <span className="pb-1.5 text-ink-2">/{plan.period}</span>
          </p>
          <p className="mt-1 h-5 text-sm text-ok">
            {period === "pro-anual" && `Equivale a $${(plan.price / 12).toFixed(2)} al mes en vez de $${monthly.price}`}
          </p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {PRO_PERKS.map((p) => (
              <li key={p} className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <form action={checkout} className="mt-8">
            <input type="hidden" name="plan" value={period} />
            <PayButton label={active ? `Extender Pro (${plan.days} días más)` : `Obtener Pro ${period === "pro-anual" ? "anual" : "mensual"}`} />
          </form>
          <p className="mt-3 text-center text-xs text-ink-3">
            Pago único con tarjeta por medio de Wompi. Sin cobros automáticos.
          </p>
        </div>
      </div>
    </div>
  );
}
