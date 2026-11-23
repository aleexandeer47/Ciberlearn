import { MessageSquare, TrendingUp } from "lucide-react";
import type { CSSProperties } from "react";
import { getT } from "@/lib/i18n-server";
import { XRayLens } from "./XRayLens";

const i = (n: number) => ({ "--i": n }) as CSSProperties;


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
export async function HeroPreview() {
  const { t } = await getT();
  // Vista de ejemplo de la página de progreso (datos ilustrativos de una cuenta).
  const SKILLS = [
    { label: t("Remitente sospechoso", "Suspicious sender"), pct: 82 },
    { label: t("Urgencia o miedo", "Urgency or fear"), pct: 64 },
    { label: t("Enlace engañoso", "Deceptive link"), pct: 41 },
  ];
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
            <p className="text-xs font-semibold">{t("EnviaYa", "ShipNow")} · +1 (786) 555-0143</p>
            <p className="mt-2 rounded-2xl rounded-tl-md bg-paper-2 px-3 py-2.5 text-[13px] leading-relaxed">
              {t("Su paquete está retenido por un saldo de $1.95. Pague hoy:", "Your parcel is on hold for a $1.95 balance. Pay today:")}{" "}
              <span className="seg seg-link" data-state="marked">
                {t("enviaya.delivery-pago.top", "shipnow.delivery-fee.top")}
              </span>
            </p>
            <span className="mt-3 inline-flex rounded-full bg-bad-soft px-2.5 py-1 text-[11px] font-semibold text-[#b91c1c]">
              {t("Dominio raro detectado", "Odd domain detected")}
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
                {t("Tus skills", "Your skills")}
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
            <p className="mt-4 text-[11px] text-ink-3">{t("Punto débil: enlace engañoso", "Weak spot: deceptive link")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
