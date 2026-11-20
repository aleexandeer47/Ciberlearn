"use client";

import { useEffect, useRef, useState } from "react";

const MODE_LABEL: Record<string, string> = {
  clasico: "Clásico",
  pro: "Pack avanzado",
  contrarreloj: "Contrarreloj",
  entrenamiento: "Entrenamiento",
};

interface Point {
  date: string;
  score: number;
  mode: string;
}

/** Línea de puntajes por ronda (0-100). Una sola serie: el título la nombra, no hace falta leyenda. */
export function HistoryChart({ points }: { points: Point[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 220;
  const pad = { l: 34, r: 14, t: 14, b: 26 };
  const iw = w - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const n = points.length;
  const x = (i: number) => pad.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / 100) * ih;
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(" ");
  const fmt = (iso: string) => new Date(iso).toLocaleDateString("es-SV", { day: "numeric", month: "short" });

  const onMove = (clientX: number) => {
    const r = wrap.current!.getBoundingClientRect();
    const rel = clientX - r.left - pad.l;
    const i = n === 1 ? 0 : Math.round((rel / iw) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  const hp = hover !== null ? points[hover] : null;

  return (
    <div ref={wrap} className="relative select-none">
      <svg
        width={w}
        height={H}
        role="img"
        aria-label={`Puntaje de tus últimas ${n} rondas`}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerLeave={() => setHover(null)}
        className="block touch-pan-y"
      >
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="var(--desk-line)" strokeDasharray={v ? "3 4" : undefined} />
            <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" className="fill-fog font-mono text-[10px]">
              {v}
            </text>
          </g>
        ))}
        {n > 0 && (
          <>
            <text x={pad.l} y={H - 6} className="fill-fog font-mono text-[10px]">
              {fmt(points[0].date)}
            </text>
            {n > 1 && (
              <text x={w - pad.r} y={H - 6} textAnchor="end" className="fill-fog font-mono text-[10px]">
                {fmt(points[n - 1].date)}
              </text>
            )}
          </>
        )}
        {hp && <line x1={x(hover!)} x2={x(hover!)} y1={pad.t} y2={pad.t + ih} stroke="var(--fog)" strokeOpacity={0.4} />}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p.score)}
            r={hover === i ? 6 : 4}
            fill="var(--accent)"
            stroke="var(--desk-2)"
            strokeWidth={2}
          />
        ))}
      </svg>
      {hp && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg bg-desk px-3 py-2 text-xs shadow-xl ring-1 ring-white/10"
          style={{ left: Math.min(Math.max(x(hover!), 70), w - 70) }}
        >
          <p className="font-semibold text-base text-chalk">{hp.score} pts</p>
          <p className="text-fog">
            {fmt(hp.date)} · {MODE_LABEL[hp.mode] ?? hp.mode}
          </p>
        </div>
      )}
      <table className="sr-only">
        <caption>Puntaje por ronda</caption>
        <tbody>
          {points.map((p, i) => (
            <tr key={i}>
              <td>{fmt(p.date)}</td>
              <td>{MODE_LABEL[p.mode] ?? p.mode}</td>
              <td>{p.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
