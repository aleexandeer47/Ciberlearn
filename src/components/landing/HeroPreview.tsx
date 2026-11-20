import { MessageSquare, TrendingUp } from "lucide-react";
import type { CSSProperties } from "react";
import { XRayLens } from "./XRayLens";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

// Vista de ejemplo de la página de progreso (datos ilustrativos de una cuenta).
const SKILLS = [
  { label: "Remitente sospechoso", pct: 82 },
  { label: "Urgencia o miedo", pct: 64 },
  { label: "Enlace engañoso", pct: 41 },
];

function Dots() {
  return (
    <span className="flex gap-1" aria-hidden>
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc20]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
    </span>
  );
}

/** Tarjetas de producto flotando sobre orbes de gradiente; la lupa va al centro. */
export function HeroPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-[1120px]" data-enter>
      {/* Orbes: solo detrás de las tarjetas, nunca detrás del texto */}
      <div className="orb orb-1 -left-16 top-0 h-[420px] w-[420px]" aria-hidden />
      <div className="orb orb-3 -right-10 top-10 h-[380px] w-[380px]" aria-hidden />
      <div className="orb orb-2 bottom-[-60px] left-1/3 h-[300px] w-[420px]" aria-hidden />

      <div className="relative grid items-start gap-6 lg:grid-cols-[1fr_minmax(0,520px)_1fr]">
        {/* SMS falso */}
        <div style={i(2)} className="hidden pt-20 lg:block">
          <div className="preview-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <Dots />
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-brand">
                <MessageSquare className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                SMS
              </span>
            </div>
            <p className="text-xs font-semibold">EnviaYa · +1 (786) 555-0143</p>
            <p className="mt-2 rounded-2xl rounded-tl-md bg-paper-2 px-3 py-2.5 text-[13px] leading-relaxed">
              Su paquete está retenido por un saldo de $1.95. Pague hoy:{" "}
              <span className="seg seg-link" data-state="marked">
                enviaya-sv.delivery-pago.top
              </span>
            </p>
            <span className="mt-3 inline-flex rounded-full bg-bad-soft px-2.5 py-1 text-[11px] font-semibold text-[#b91c1c]">
              Dominio raro detectado
            </span>
          </div>
        </div>

        <div style={i(1)}>
          <XRayLens />
        </div>

        {/* Vista de progreso */}
        <div style={i(3)} className="hidden pt-32 lg:block">
          <div className="preview-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <Dots />
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-brand">
                <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Tus skills
              </span>
            </div>
            <ul className="space-y-3">
              {SKILLS.map((s, n) => (
                <li key={s.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium">{s.label}</span>
                    <span className="tabular-nums text-ink-3">{s.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-paper-2">
                    <div
                      className="bar-fill h-full rounded-full bg-[#2563eb]"
                      style={{ width: `${s.pct}%`, "--i": n + 4 } as CSSProperties}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] text-ink-3">Punto débil: enlace engañoso</p>
          </div>
        </div>
      </div>
    </div>
  );
}
