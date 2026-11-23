"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/components/i18n/LangProvider";
import type { Lang } from "@/lib/i18n";
import { CATEGORIES, categoryLabels } from "@/lib/scenarios/categories";
import type { SignalCategory } from "@/lib/scenarios/types";

const EXAMPLES: Record<Lang, Record<SignalCategory, string>> = {
  es: {
    remitente: "soporte@grupoatlacatl-com.net",
    urgencia: "Si no responde HOY, su cuenta será eliminada",
    enlace: "“Verificar” → verificar-cuenta.co",
    solicitud: "Envíenos su PIN para depositarle",
    suplantacion: "Hola mami, cambié de número",
    adjunto: "Formulario_Devolucion.zip",
    oferta: "Gane $200 diarios dando likes",
    contexto: "Su paquete está retenido (no pediste nada)",
  },
  en: {
    remitente: "support@atlacatlgroup-com.net",
    urgencia: "If you don't reply TODAY, your account will be deleted",
    enlace: "“Verify” → verify-account.co",
    solicitud: "Send us your PIN so we can deposit the money",
    suplantacion: "Hi mom, I changed my number",
    adjunto: "Refund_Form.zip",
    oferta: "Earn $200 a day liking videos",
    contexto: "Your parcel is on hold (you didn't order anything)",
  },
};

/** Lista de señales: cada fila se abre para mostrar cómo se ve en un mensaje. */
export function SignalCards() {
  const lang = useLang();
  const L = categoryLabels(lang);
  const [open, setOpen] = useState<SignalCategory | null>("remitente");

  return (
    <ul className="divide-y divide-desk-line border-y border-desk-line">
      {CATEGORIES.map((cat, i) => {
        const c = L[cat];
        const isOpen = open === cat;
        return (
          <li key={cat}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : cat)}
              className="group flex w-full items-center gap-4 py-4 text-left"
            >
              <span className="w-6 font-mono text-xs text-fog">0{i + 1}</span>
              <span className="flex-1">
                <span
                  className={`block font-medium transition-colors duration-150 ${isOpen ? "text-chalk" : "text-chalk/85 group-hover:text-chalk"}`}
                >
                  {c.label}
                </span>
                <span className="mt-0.5 block text-sm text-fog">{c.hint}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-fog transition-transform duration-200 ease-[var(--ease-out)] ${isOpen ? "rotate-180" : ""}`}
                strokeWidth={1.5}
                aria-hidden
              />
            </button>
            {isOpen && (
              <div className="reveal-item pb-5 pl-10">
                <p className="inline-block rounded-lg bg-paper px-3 py-2 font-mono text-[13px] text-ink ring-1 ring-line">
                  <span className="seg" data-state="marked">
                    {EXAMPLES[lang][cat]}
                  </span>
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
