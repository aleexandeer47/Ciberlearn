"use client";

import { useEffect, useRef, useState } from "react";
import type { DayPoint } from "@/lib/adminStats";

const fmt = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString("es-SV", { day: "numeric", month: "short" });

/** Visitas por día (barras, una sola serie). El tooltip suma inicios de sesión y registros del día. */
export function TrafficChart({ series }: { series: DayPoint[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(720);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 240;
  const pad = { l: 36, r: 8, t: 12, b: 28 };
  const iw = w - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const max = Math.max(4, ...series.map((p) => p.visits));
  const nice = Math.ceil(max / 4) * 4;
  const step = iw / series.length;
  const bw = Math.max(3, step - 4);
  const y = (v: number) => pad.t + ih - (v / nice) * ih;
  const empty = series.every((p) => p.visits === 0);
  const hp = hover !== null ? series[hover] : null;

  return (
    <div ref={wrap} className="relative">
      <svg width={w} height={H} role="img" aria-label="Visitas por día en los últimos 30 días" className="block">
        {[0, nice / 2, nice].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="var(--desk-line)" strokeDasharray={v ? "3 4" : undefined} />
            <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" className="fill-fog font-mono text-[10px]">
              {v}
            </text>
          </g>
        ))}
        {series.map((p, i) => {
          const x = pad.l + i * step + (step - bw) / 2;
          const h = Math.max(p.visits ? 2 : 0, ih - (y(p.visits) - pad.t));
          return (
            <g key={p.day} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* Zona de hover más grande que la barra */}
              <rect x={pad.l + i * step} y={pad.t} width={step} height={ih} fill="transparent" />
              <rect
                x={x}
                y={pad.t + ih - h}
                width={bw}
                height={h}
                rx={Math.min(4, bw / 2)}
                fill="var(--brand)"
                opacity={hover === null || hover === i ? 1 : 0.45}
                className="transition-opacity duration-150"
              />
            </g>
          );
        })}
        <text x={pad.l} y={H - 8} className="fill-fog font-mono text-[10px]">
          {fmt(series[0].day)}
        </text>
        <text x={w - pad.r} y={H - 8} textAnchor="end" className="fill-fog font-mono text-[10px]">
          Hoy
        </text>
      </svg>

      {empty && (
        <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-fog">
          Todavía no hay visitas registradas. El conteo empieza desde esta versión.
        </p>
      )}

      {hp && (
        <div
          className="pointer-events-none absolute top-0 z-10 w-44 -translate-x-1/2 rounded-xl border border-desk-line bg-desk-2 p-3 text-xs shadow-[0_12px_32px_-12px_var(--shadow)]"
          style={{ left: Math.min(Math.max(pad.l + hover! * step + step / 2, 90), w - 90) }}
        >
          <p className="mb-2 font-semibold">{fmt(hp.day)}</p>
          {[
            ["Visitas", hp.visits],
            ["Inicios de sesión", hp.logins],
            ["Registros nuevos", hp.signups],
          ].map(([l, v]) => (
            <p key={l as string} className="flex justify-between gap-3 text-fog">
              {l}
              <span className="font-medium tabular-nums text-chalk">{v}</span>
            </p>
          ))}
        </div>
      )}

      <table className="sr-only">
        <caption>Actividad por día</caption>
        <thead>
          <tr>
            <th>Día</th>
            <th>Visitas</th>
            <th>Inicios de sesión</th>
            <th>Registros</th>
          </tr>
        </thead>
        <tbody>
          {series.map((p) => (
            <tr key={p.day}>
              <td>{p.day}</td>
              <td>{p.visits}</td>
              <td>{p.logins}</td>
              <td>{p.signups}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
