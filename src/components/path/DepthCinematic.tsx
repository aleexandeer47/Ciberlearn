"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useLang, useT } from "@/components/i18n/LangProvider";
import { sfx } from "@/lib/sfx";
import { CREATURES, creatureFor, LEVIATHAN, type Creature } from "./Creatures";
import { fmtDepth, ZONES } from "./DiveMap";

/*
 * Cinemática de la inmersión: al terminar una zona, la cámara se aleja y muestra el corte del océano
 * completo (con edificios reales como escala), el pez baja a la zona nueva, la cámara se acerca y el pez
 * se transforma. Al llegar a la Fosa de las Marianas todo se vuelve oscuro y algo te mira.
 *
 * Modos:
 *   "zona"      terminaste la zona `from` y bajas a `to` (con transformación)
 *   "final"     venciste al Leviatán: te conviertes en él
 *   "recorrido" solo ver dónde vas (la cámara se aleja y ya)
 */

type Mode = "zona" | "final" | "recorrido";

// ---------- Mundo: corte del océano (coordenadas del SVG) ----------
const W = 1000;
const H = 620;
const SURFACE = 70;
const MAX = ZONES[ZONES.length - 1].depth;
/** Profundidad a altura: raíz cuadrada, para que las zonas de arriba no queden aplastadas. */
const yOf = (m: number) => SURFACE + 520 * Math.sqrt(Math.max(0, m) / MAX);
const xOf = (i: number) => 30 + (i * 910) / (ZONES.length - 1);
const PTS = ZONES.map((z, i) => [xOf(i), yOf(z.depth)] as const);

/** x donde el fondo tiene esa profundidad (para parar los edificios sobre la pendiente). */
function xAtDepth(m: number) {
  for (let i = 1; i < ZONES.length; i++) {
    const a = ZONES[i - 1].depth;
    const b = ZONES[i].depth;
    if (m >= a && m <= b) return PTS[i - 1][0] + ((m - a) / (b - a)) * (PTS[i][0] - PTS[i - 1][0]);
  }
  return PTS[PTS.length - 1][0];
}

function seabedPath() {
  let d = `M 0 ${SURFACE - 6} L ${PTS[0][0]} ${PTS[0][1]}`;
  for (let i = 1; i < PTS.length; i++) {
    const [x0, y0] = PTS[i - 1];
    const [x1, y1] = PTS[i];
    const mx = (x0 + x1) / 2;
    d += ` C ${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`;
  }
  return d + ` L 975 ${yOf(9000)} L ${W} ${yOf(6000)}`;
}
const SEABED = seabedPath();

// Siluetas en una caja de 100 de alto (ancho propio). Dibujos simples propios, solo para dar escala.
const LANDMARKS = [
  {
    id: "libertad",
    name: { es: "Estatua de la Libertad · 93 m", en: "Statue of Liberty · 93 m" },
    meters: 93,
    w: 40,
    d: "M14 100 V62 H26 V100 Z M17 62 L16 38 L18 24 L20 14 L22 24 L24 38 L23 62 Z M22 16 L27 2 L29 3 L24 18 Z M26 0 L30 0 L29 3 L27 3 Z M17 14 L20 8 L23 14 Z",
  },
  {
    id: "eiffel",
    name: { es: "Torre Eiffel · 330 m", en: "Eiffel Tower · 330 m" },
    meters: 330,
    w: 60,
    d: "M29 0 H31 L32 16 L36 40 L43 70 L58 100 H45 Q40 82 30 80 Q20 82 15 100 H2 L17 70 L24 40 L28 16 Z M20 68 H40 M25 40 H35",
  },
  {
    id: "burj",
    name: { es: "Burj Khalifa · 828 m", en: "Burj Khalifa · 828 m" },
    meters: 828,
    w: 30,
    d: "M15 0 L16 18 L18 36 L20 54 L23 72 L26 100 H4 L7 72 L10 54 L12 36 L14 18 Z",
  },
] as const;

const EVEREST = "M0 100 L30 70 L48 76 L80 30 L96 6 L104 0 L116 18 L140 40 L160 34 L200 100";

// ---------- Utilidades de animación ----------
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const seg = (t: number, a: number, b: number) => ease(clamp((t - a) / (b - a)));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

interface Timeline {
  zoomOut: [number, number];
  travel: [number, number];
  zoomIn: [number, number];
  /** Empieza la transformación; el destello llega 1.1 s después */
  morph: number;
  /** Oscuridad y ojos (Fosa de las Marianas) */
  dark?: number;
  end: number;
}

function timeline(mode: Mode, mariana: boolean): Timeline {
  if (mode === "recorrido") return { zoomOut: [0.3, 2.4], travel: [99, 99], zoomIn: [99, 99], morph: 99, end: 2.6 };
  if (mode === "final") return { zoomOut: [0.4, 2.6], travel: [99, 99], zoomIn: [2.8, 4.2], morph: 4.4, dark: 0.2, end: 7.4 };
  if (mariana) return { zoomOut: [0.5, 2.6], travel: [2.8, 4.6], zoomIn: [4.7, 6.2], morph: 8.0, dark: 4.9, end: 10.6 };
  return { zoomOut: [0.5, 2.6], travel: [2.8, 4.6], zoomIn: [4.7, 5.9], morph: 6.1, end: 8.9 };
}

export function DepthCinematic({ mode, from, to, onClose }: { mode: Mode; from: number; to: number; onClose: () => void }) {
  const lang = useLang();
  const t = useT();
  const last = ZONES.length - 1;
  const mariana = mode === "zona" && to === last;
  const tl = timeline(mode, mariana);
  const [time, setTime] = useState(0);
  const played = useRef(new Set<string>());

  // Reloj de la animación (con “prefers-reduced-motion” se salta al final)
  useEffect(() => {
    // Sin movimiento: el primer cuadro ya es el final
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const s = reduced ? tl.end + 1 : (now - t0) / 1000;
      setTime(s);
      if (s < tl.end + 0.2) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tl.end]);

  // Sonidos en su momento
  const once = useCallback((key: string, at: number, fn: () => void) => {
    if (time >= at && !played.current.has(key)) {
      played.current.add(key);
      fn();
    }
  }, [time]);
  useEffect(() => {
    if (mode === "final") once("roar", 0.2, sfx.roar);
    once("dive", tl.zoomOut[0], sfx.dive);
    if (tl.dark !== undefined && mode !== "final") once("roar", tl.dark + 0.4, sfx.roar);
    if (mode !== "recorrido") once("evolve", tl.morph, sfx.evolve);
  }, [time, mode, tl, once]);

  // Escape cierra
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ---------- Cámara ----------
  const P = (i: number) => PTS[Math.max(0, Math.min(last, i))];
  const [fx, fy] = P(from);
  const [tx, ty] = P(to);
  const travel = seg(time, ...tl.travel);
  // El pez baja por el fondo de una zona a la otra
  const fishX = lerp(fx, tx, travel);
  const fishY = lerp(fy, ty, travel) - 14;
  const out = seg(time, ...tl.zoomOut);
  const inn = seg(time, ...tl.zoomIn);
  const ZIN = 4.2;
  // Del acercamiento en `from` a la vista completa, y de ahí al acercamiento en `to`
  const zoom = inn > 0 ? lerp(1, ZIN, inn) : lerp(ZIN, 1, out);
  const cx = inn > 0 ? lerp(W / 2, tx, inn) : lerp(fx, W / 2, out);
  const cy = inn > 0 ? lerp(H / 2 + 10, ty - 20, inn) : lerp(fy - 20, H / 2 + 10, out);
  const camera = `translate(${W / 2} ${H / 2}) scale(${zoom}) translate(${-cx} ${-cy})`;

  const depthNow = Math.round(lerp(ZONES[from].depth, ZONES[to].depth, travel));
  const overview = out > 0.6 && inn < 0.4 ? clamp((out - 0.6) / 0.3) * (1 - clamp(inn / 0.4)) : 0;

  // ---------- Transformación ----------
  const oldC: Creature = mode === "final" ? creatureFor(last) : creatureFor(from);
  const newC: Creature = mode === "final" ? LEVIATHAN : creatureFor(to);
  const flashAt = tl.morph + 1.1;
  const morphOn = mode !== "recorrido" && time >= tl.morph - 0.3;
  const charge = clamp((time - tl.morph) / 1.1);
  const flash = time >= flashAt ? clamp(1 - (time - flashAt) / 0.7) : 0;
  const reveal = clamp((time - flashAt) / 0.6);
  const shake = time < flashAt ? Math.sin(time * 70) * 6 * charge * charge : 0;
  const dark = tl.dark !== undefined ? clamp((time - tl.dark) / 1.2) * (mode === "final" ? 0.55 : 0.82) : 0;
  const scary = mariana || mode === "final";
  const done = time >= tl.end;
  const crossesSections = mode === "zona" && from === CREATURES.findIndex((c) => c.name.es === "Kraken");

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black text-white" role="dialog" aria-modal="true" aria-label={t("Inmersión", "Deep dive")}>
      {/* Mundo */}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="cine-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d6fa3" />
            <stop offset="0.25" stopColor="#0b3a63" />
            <stop offset="0.55" stopColor="#06172e" />
            <stop offset="0.8" stopColor="#03040f" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <linearGradient id="cine-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1430" />
            <stop offset="1" stopColor="#3a5f8f" />
          </linearGradient>
        </defs>
        <g transform={camera}>
          <rect x={-2000} y={-2000} width={5000} height={2000 + SURFACE} fill="url(#cine-sky)" />
          {/* El agua se oscurece con la profundidad (el degradado cubre justo la altura del corte) */}
          <rect x={-2000} y={SURFACE} width={5000} height={H - SURFACE} fill="url(#cine-sea)" />
          <rect x={-2000} y={H} width={5000} height={2000} fill="#000" />
          {/* Superficie */}
          <path d={`M -2000 ${SURFACE} H 3000`} stroke="#93c5fd" strokeWidth="1.2" opacity="0.7" />
          {/* Edificios para dar escala: llegan justo a la superficie */}
          {LANDMARKS.map((l, n) => {
            const base = yOf(l.meters);
            const h = base - SURFACE;
            const k = h / 100;
            const x = xAtDepth(l.meters);
            return (
              <g key={l.id} opacity={0.35 + 0.65 * overview}>
                <g transform={`translate(${x - (l.w * k) / 2} ${SURFACE}) scale(${k})`}>
                  <path d={l.d} fill="#cbd5e1" stroke="#f8fafc" strokeWidth={0.6 / k} opacity="0.85" />
                </g>
                {/* Etiquetas escalonadas para que no se encimen */}
                <line x1={x} y1={SURFACE - 4} x2={x} y2={SURFACE - 8 - n * 13} stroke="#e2e8f0" strokeWidth="0.6" opacity={overview * 0.7} />
                <text x={x} y={SURFACE - 11 - n * 13} textAnchor="middle" fontSize="10" fontWeight="600" fill="#f1f5f9" opacity={overview}>
                  {l.name[lang]}
                </text>
              </g>
            );
          })}
          {/* Fondo del mar con su borde iluminado */}
          <path d={`${SEABED} V ${H + 2000} H 0 Z`} fill="#050505" />
          <path d={SEABED} fill="none" stroke="#f59e0b" strokeWidth="2.4" style={{ filter: "drop-shadow(0 0 4px #f59e0b)" }} />
          {/* El Everest cabría dentro de la Fosa de las Marianas (y aún le quedarían 2 km de agua encima) */}
          <g opacity={overview * 0.95}>
            <g transform={`translate(${PTS[last][0] - 62} ${yOf(MAX - 8849)}) scale(0.62 ${(yOf(MAX) - yOf(MAX - 8849)) / 100})`}>
              <path d={EVEREST} fill="rgb(253 164 175 / 0.08)" stroke="#fda4af" strokeWidth={1.4} strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
            </g>
            <text x={PTS[last][0] - 40} y={yOf(MAX - 8849) - 10} textAnchor="end" fontSize="10" fontWeight="600" fill="#fda4af">
              {t("El Everest (8,849 m) cabría aquí", "Mount Everest (8,849 m) would fit here")}
            </text>
          </g>
          {/* Zonas: una luz por zona; las ya superadas brillan */}
          {PTS.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={i <= Math.max(from, to) ? 3.4 : 2.4} fill={i === last ? "#ef4444" : i <= Math.max(from, to) ? "#fde68a" : "#78716c"} />
              <text x={x} y={y + 15} textAnchor="middle" fontSize="8" fill="#e7e5e4" opacity={overview * (i === to || i === from || i === 7 || i === last ? 1 : 0.55)}>
                {ZONES[i].name[lang]} · {fmtDepth(ZONES[i].depth)}
              </text>
            </g>
          ))}
          {/* El pez */}
          <g transform={`translate(${fishX} ${fishY})`}>
            <circle r="14" fill="#fde68a" opacity="0.15" />
            <foreignObject x={-16} y={-10} width={32} height={20}>
              <FishIcon creature={time < tl.morph + 1.1 || mode === "recorrido" ? oldC : newC} />
            </foreignObject>
          </g>
        </g>
      </svg>

      {/* Oscuridad de las Marianas y ojos que se abren */}
      {scary && (
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 50% 55%, rgb(0 0 0 / ${dark * 0.55}) 0%, rgb(0 0 0 / ${dark}) 60%)` }}>
          {[
            [12, 22, 0.2], [80, 16, 0.9], [20, 70, 1.5], [86, 64, 0.5], [50, 12, 1.2], [8, 46, 1.9], [92, 40, 2.3],
          ].map(([l, tp, d], n) => (
            <span
              key={n}
              className="absolute flex gap-2"
              style={{ left: `${l}%`, top: `${tp}%`, opacity: clamp((time - (tl.dark ?? 0) - d) / 0.6) * (0.6 + 0.4 * Math.sin(time * 3 + n)) }}
            >
              <i className="block h-2 w-5 rounded-full bg-[#ef4444] shadow-[0_0_14px_#ef4444]" />
              <i className="block h-2 w-5 rounded-full bg-[#ef4444] shadow-[0_0_14px_#ef4444]" />
            </span>
          ))}
          {/* Unos ojos enormes al fondo: el Leviatán */}
          {mariana && (
            <div className="absolute left-1/2 top-[30%] flex -translate-x-1/2 gap-24" style={{ opacity: clamp((time - (tl.dark ?? 0) - 1.6) / 1.4) * 0.85 }}>
              <span className="block h-6 w-24 rounded-[50%] bg-[#b91c1c] shadow-[0_0_60px_20px_rgba(185,28,28,0.6)]" />
              <span className="block h-6 w-24 rounded-[50%] bg-[#b91c1c] shadow-[0_0_60px_20px_rgba(185,28,28,0.6)]" />
            </div>
          )}
        </div>
      )}

      {/* Textos */}
      <div className="pointer-events-none absolute inset-x-0 top-0 p-6 text-center sm:p-10">
        {mode === "zona" && time < tl.zoomIn[0] && (
          <p className="font-display text-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-3xl" style={{ opacity: clamp(time / 0.5) }}>
            {crossesSections ? t("¡Sección 1 completada!", "Section 1 complete!") : t("¡Zona superada!", "Zone cleared!")}
          </p>
        )}
        {mode === "recorrido" && (
          <p className="font-display text-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-3xl">{t("Tu inmersión", "Your dive")}</p>
        )}
        {(mode === "zona" || mode === "recorrido") && !(mariana && time > (tl.dark ?? 0) + 0.8) && (
          <p className="mt-2 font-mono text-lg tabular-nums text-[#fde68a] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {fmtDepth(mode === "recorrido" ? ZONES[to].depth : depthNow)}
          </p>
        )}
        {mariana && time > (tl.dark ?? 0) + 0.8 && time < tl.morph && (
          <div className="mt-8" style={{ opacity: clamp((time - (tl.dark ?? 0) - 0.8) / 0.8) }}>
            <p className="font-display text-3xl text-[#ef4444] sm:text-5xl" style={{ textShadow: "0 0 20px rgba(239,68,68,0.8)" }}>
              {t("Fosa de las Marianas", "Mariana Trench")}
            </p>
            <p className="mt-2 font-mono text-lg text-[#fca5a5]">10,935 m</p>
            <p className="mt-4 text-white/80">
              {t("Aquí no llega la luz. Algo enorme se mueve en la oscuridad…", "No light reaches here. Something huge is moving in the dark…")}
            </p>
          </div>
        )}
        {mode === "final" && time < tl.morph && (
          <div style={{ opacity: clamp(time / 0.6) }}>
            <p className="font-display text-3xl text-[#ef4444] sm:text-5xl" style={{ textShadow: "0 0 20px rgba(239,68,68,0.8)" }}>
              {t("Venciste al Leviatán", "You defeated the Leviathan")}
            </p>
            <p className="mt-3 text-white/80">{t("Tocaste el fondo del planeta: 10,935 metros.", "You touched the bottom of the planet: 10,935 meters.")}</p>
          </div>
        )}
      </div>

      {/* Transformación */}
      {morphOn && (
        <div className="absolute inset-0 grid place-items-center" style={{ background: `rgb(0 0 0 / ${clamp((time - tl.morph + 0.3) / 0.4) * 0.65})` }}>
          <div className="relative grid place-items-center">
            {/* Anillos de energía */}
            {[0, 1, 2].map((n) => {
              const p = clamp((time - flashAt - n * 0.15) / 0.9);
              return (
                <span
                  key={n}
                  className="absolute rounded-full border-2"
                  style={{
                    width: 120 + p * 380,
                    height: 120 + p * 380,
                    opacity: p > 0 ? 1 - p : 0,
                    borderColor: scary ? "#ef4444" : "#fde68a",
                  }}
                />
              );
            })}
            <div
              className="relative h-40 w-56 sm:h-52 sm:w-72"
              style={{
                transform: `translateX(${shake}px) scale(${time < flashAt ? 1 + charge * 0.15 : 0.6 + 0.4 * ease(reveal)})`,
                filter: time < flashAt ? `brightness(${1 + charge * 2.5}) drop-shadow(0 0 ${charge * 30}px ${scary ? "#ef4444" : "#fde68a"})` : `drop-shadow(0 0 ${20 * (1 - reveal) + 8}px ${scary ? "#ef4444" : "#fde68a"})`,
              }}
            >
              {time < flashAt ? <oldC.Svg className="h-full w-full" /> : <newC.Svg className="h-full w-full" />}
            </div>
          </div>
          {time >= flashAt && (
            <div className="absolute inset-x-0 bottom-[14%] px-6 text-center" style={{ opacity: reveal }}>
              <p className={`text-sm font-bold uppercase tracking-[0.2em] ${scary ? "text-[#fca5a5]" : "text-[#fde68a]"}`}>
                {mode === "final" ? t("Tu forma final", "Your final form") : t("¡Tu pez evolucionó!", "Your fish evolved!")}
              </p>
              <p className="mt-2 font-display text-3xl sm:text-4xl">
                {t("Ahora eres:", "You are now:")} {newC.name[lang]}
              </p>
              {mode === "zona" && (
                <p className="mt-2 text-white/70">
                  {ZONES[to].name[lang]} · {fmtDepth(ZONES[to].depth)}
                </p>
              )}
              {mariana && (
                <p className="mt-3 text-[#fca5a5]">
                  {t("Al final de esta zona te espera el Leviatán.", "At the end of this zone, the Leviathan is waiting.")}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Destello */}
      {flash > 0 && <div className="pointer-events-none absolute inset-0" style={{ background: scary ? `rgb(239 68 68 / ${flash})` : `rgb(255 255 255 / ${flash})` }} />}

      {/* Botones */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur hover:bg-white/20"
      >
        {done ? <X className="h-4 w-4" aria-hidden /> : null}
        {done ? t("Cerrar", "Close") : t("Saltar", "Skip")}
      </button>
      {done && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <button type="button" onClick={onClose} className={`btn h-12 px-8 text-base ${scary ? "bg-[#dc2626] text-white hover:bg-[#b91c1c]" : "btn-primary"}`}>
            {t("Continuar", "Continue")}
          </button>
        </div>
      )}
    </div>
  );
}

/** El pez dentro del SVG (mirando hacia la derecha, hacia donde baja). */
function FishIcon({ creature }: { creature: Creature }) {
  const style: CSSProperties = { width: "100%", height: "100%" };
  return (
    <div style={style}>
      <creature.Svg className="h-full w-full" />
    </div>
  );
}
