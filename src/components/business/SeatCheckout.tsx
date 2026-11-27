"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { addSeatsCheckout, familyCheckout, orgCheckout } from "@/app/actions/org";
import { useT } from "@/components/i18n/LangProvider";
import { SalesSoon, useClosedLabel, useSalesOpen } from "@/components/billing/SalesSoon";
import { ConsentChecks } from "@/components/legal/ConsentChecks";
import { addSeatsPrice, BUSINESS, FAMILY, yearPrice } from "@/lib/business";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/** Botón de pago; mientras las ventas están cerradas muestra el anuncio y queda desactivado. */
function PayButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const t = useT();
  const open = useSalesOpen();
  const closedLabel = useClosedLabel();
  return (
    <>
      <SalesSoon />
      <button type="submit" disabled={pending || !open} className="btn btn-primary w-full px-6 py-3.5 disabled:opacity-60">
        {!open ? closedLabel : pending ? t("Preparando el pago…", "Preparing payment…") : label}
      </button>
    </>
  );
}

function Stepper({ value, min, max, onChange, name }: { value: number; min: number; max: number; onChange: (n: number) => void; name: string }) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n) || min));
  const t = useT();
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(clamp(value - 1))} className="btn btn-ghost h-11 w-11 p-0" aria-label={t("Uno menos", "One less")}>
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <input
        name={name}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={(e) => onChange(clamp(Number(e.target.value)))}
        className="field h-11 w-24 text-center font-display text-xl tabular-nums"
        aria-label={t("Cantidad de personas", "Number of people")}
      />
      <button type="button" onClick={() => onChange(clamp(value + 1))} className="btn btn-ghost h-11 w-11 p-0" aria-label={t("Uno más", "One more")}>
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

/** Comprar o renovar un año. `minSeats`: no menos que las personas ya dentro (o los puestos vigentes). */
export function SeatCheckout({
  mode,
  defaultSeats = 10,
  minSeats = BUSINESS.minSeats,
}: {
  mode: "nueva" | "renovar";
  defaultSeats?: number;
  minSeats?: number;
}) {
  const min = Math.max(BUSINESS.minSeats, minSeats);
  const [seats, setSeats] = useState(Math.max(min, defaultSeats));
  const valid = seats >= min && seats <= BUSINESS.maxSeats;
  const t = useT();

  return (
    <form action={orgCheckout} className="space-y-5">
      {mode === "nueva" && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t("Nombre de tu empresa u organización", "Your company or organization name")}</span>
          <input name="name" required minLength={2} maxLength={80} placeholder={t("Ej.: Distribuidora Las Palmas", "E.g. Palm Tree Supplies")} className="field" />
        </label>
      )}
      <div>
        <span className="mb-1.5 block text-sm font-medium">{t("¿Cuántas personas van a entrenar? (te incluye a ti)", "How many people will train? (including you)")}</span>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Stepper name="seats" value={seats} min={min} max={BUSINESS.maxSeats} onChange={setSeats} />
          <div className="text-right">
            <p className="font-display text-3xl tabular-nums">{valid ? usd(yearPrice(seats)) : "—"}</p>
            <p className="text-xs text-fog">
              {usd(BUSINESS.seatPrice)} {t("por persona al año · mínimo", "per person per year · minimum")} {min}
            </p>
          </div>
        </div>
      </div>
      <ConsentChecks />
      <PayButton
        label={
          mode === "nueva"
            ? t("Pagar y activar mi empresa", "Pay and activate my company")
            : t(`Renovar por 1 año (${usd(yearPrice(seats))})`, `Renew for 1 year (${usd(yearPrice(seats))})`)
        }
      />
      <p className="text-center text-xs text-fog">
        {t("Pago único con tarjeta por medio de Wompi. Sin cobros automáticos.", "One-time card payment through Wompi. No automatic charges.")}
      </p>
    </form>
  );
}

/** Comprar o renovar Pro Familiar (precio y puestos fijos). */
export function FamilyCheckout({ mode }: { mode: "nueva" | "renovar" }) {
  const t = useT();
  return (
    <form action={familyCheckout} className="space-y-5">
      {mode === "nueva" && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t("Nombre de tu familia (opcional)", "Your family name (optional)")}</span>
          <input name="name" maxLength={60} placeholder={t("Ej.: Familia Martínez", "E.g. The Smith family")} className="field" />
        </label>
      )}
      <ConsentChecks />
      <PayButton
        label={
          mode === "nueva"
            ? t(`Pagar ${usd(FAMILY.price)} y activar`, `Pay ${usd(FAMILY.price)} and activate`)
            : t(`Renovar por 1 año (${usd(FAMILY.price)})`, `Renew for 1 year (${usd(FAMILY.price)})`)
        }
      />
      <p className="text-center text-xs text-fog">
        {t("Pago único con tarjeta por medio de Wompi. Sin cobros automáticos.", "One-time card payment through Wompi. No automatic charges.")}
      </p>
    </form>
  );
}

/** Agregar puestos a un plan vigente: precio proporcional hasta el vencimiento. */
export function AddSeats({ paidUntil, current }: { paidUntil: string; current: number }) {
  const [add, setAdd] = useState(5);
  const max = BUSINESS.maxSeats - current;
  const price = addSeatsPrice(add, new Date(paidUntil));
  const t = useT();
  if (max < 1) return <p className="text-sm text-fog">{t("Ya tienes el máximo de puestos.", "You already have the maximum number of seats.")}</p>;
  return (
    <form action={addSeatsCheckout} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Stepper name="add" value={add} min={1} max={max} onChange={setAdd} />
        <div className="text-right">
          <p className="font-display text-2xl tabular-nums">{usd(price)}</p>
          <p className="text-xs text-fog">{t("proporcional a los días que faltan", "prorated to the days left")}</p>
        </div>
      </div>
      <ConsentChecks />
      <PayButton label={t(`Agregar ${add} puesto${add === 1 ? "" : "s"}`, `Add ${add} seat${add === 1 ? "" : "s"}`)} />
    </form>
  );
}
