import { Check, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Unit } from "@/lib/path/content";

/*
 * La ruta como una inmersión: cada unidad es una zona del mar, más profunda (y difícil) que la anterior.
 * El sedal baja serpenteando por las lecciones; el tramo recorrido brilla y el pez marca dónde vas.
 * Phishing viene de “fishing” (pescar): aquí aprendes a reconocer los anzuelos.
 */

const ZONES = [
  { name: "Superficie", depth: "0 m" },
  { name: "Arrecife", depth: "20 m" },
  { name: "Bosque de algas", depth: "50 m" },
  { name: "Mar abierto", depth: "120 m" },
  { name: "Zona crepuscular", depth: "300 m" },
  { name: "Corrientes frías", depth: "700 m" },
  { name: "Zona de medianoche", depth: "1,500 m" },
  { name: "El abismo", depth: "4,000 m" },
];
export const zoneOf = (i: number) => ZONES[i] ?? { name: `Profundidad ${i + 1}`, depth: "" };

const ROW = 150; // distancia vertical entre lecciones
const TAIL = 40;

/** "area": lección abierta por el área que le asignó su empresa, fuera del orden normal */
type State = "done" | "current" | "area" | "locked";
export interface DiveLesson {
  id: string;
  title: string;
  questions: number;
  state: State;
  href?: string;
}

/** Posición horizontal (%) de la lección número `g` de toda la ruta: una curva de serpiente. */
const xOf = (g: number) => 50 + 27 * Math.sin(g * 1.2 + 0.4);

/** Curva suave entre puntos (tangentes verticales: el sedal “cuelga”). */
function curve(points: [number, number][]) {
  if (!points.length) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const my = (y0 + y1) / 2;
    d += ` C ${x0} ${my} ${x1} ${my} ${x1} ${y1}`;
  }
  return d;
}

function Hook() {
  return (
    <svg viewBox="0 0 24 64" className="h-16 w-6 text-white/45" aria-hidden>
      <line x1="12" y1="0" x2="12" y2="34" stroke="currentColor" strokeWidth="1" />
      <path d="M12 34 v14 a6 6 0 1 1 -6 -6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M6 42 l-2.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Fish() {
  return (
    <svg viewBox="0 0 48 28" className="dive-fish h-7 w-12 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]" aria-hidden>
      <path d="M8 14 C 14 3, 32 2, 40 14 C 32 26, 14 25, 8 14 Z" fill="#fbbf24" />
      <path d="M8 14 L 1 6 L 2 14 L 1 22 Z" fill="#f59e0b" />
      <circle cx="33" cy="12" r="2.2" fill="#0a0f1c" />
      <path d="M22 9 q 3 5 0 10" stroke="#f59e0b" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

// Burbujas decorativas (posiciones fijas para que el servidor y el navegador coincidan)
const BUBBLES = [
  [8, 6, 0], [18, 4, 3], [30, 5, 6], [44, 3, 1.5], [57, 6, 4.5], [69, 4, 7], [81, 5, 2.5], [92, 3, 5.5],
  [12, 4, 8.5], [37, 5, 10], [63, 3, 9], [86, 4, 11],
] as const;

export function DiveMap({ units, lessons, loggedIn }: { units: Unit[]; lessons: Map<string, DiveLesson>; loggedIn: boolean }) {
  // Índice global de la primera lección de cada zona
  const starts = units.map((_, u) => units.slice(0, u).reduce((a, x) => a + x.lessons.length, 0));
  return (
    <div className="dive-sea relative overflow-hidden rounded-[2rem] text-white shadow-[0_30px_80px_-40px_rgba(2,6,23,0.9)]">
      {/* Superficie: olas y rayos de luz */}
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-6 w-full text-white/25" aria-hidden>
        <path d="M0 20 Q 75 0 150 20 T 300 20 T 450 20 T 600 20 T 750 20 T 900 20 T 1050 20 T 1200 20 V0 H0 Z" fill="currentColor" />
      </svg>
      <div className="dive-rays pointer-events-none absolute inset-x-0 top-0 h-[700px]" aria-hidden />

      {/* Burbujas en toda la profundidad */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {[0.18, 0.45, 0.72, 0.95].map((band) =>
          BUBBLES.map(([left, size, delay], n) => (
            <span
              key={`${band}-${n}`}
              className="dive-bubble absolute rounded-full border border-white/40 bg-white/10"
              style={
                {
                  left: `${left}%`,
                  top: `${band * 100 - ((n * 7) % 13)}%`,
                  width: size * 2,
                  height: size * 2,
                  "--delay": `${delay + band * 3}s`,
                  "--dur": `${8 + (n % 4) * 2}s`,
                } as CSSProperties
              }
            />
          )),
        )}
      </div>

      <ol className="relative">
        {units.map((unit, u) => {
          const zone = zoneOf(u);
          const expert = unit.level === "Experto";
          const list = unit.lessons.map((l) => lessons.get(l.id)!);
          // Área de lecciones (debajo del letrero de la zona, que tiene su propio alto)
          const height = list.length * ROW + TAIL;
          const start = starts[u];
          const pts: [number, number][] = list.map((_, i) => [xOf(start + i), i * ROW + ROW / 2]);
          // El sedal entra por arriba al centro y sale por abajo hacia la siguiente zona
          const all: [number, number][] = [[50, 0], ...pts, [50, height]];
          const doneCount = list.filter((l) => l.state === "done").length;
          const zoneDone = doneCount === list.length;
          // Tramo recorrido: hasta la lección actual (o toda la zona si está superada)
          const curIdx = list.findIndex((l) => l.state === "current");
          const reached = zoneDone ? all.length : curIdx >= 0 ? curIdx + 2 : doneCount > 0 ? doneCount + 1 : 0;
          const donePath = reached > 1 ? curve(all.slice(0, reached)) : "";
          const lineColor = expert ? "#fbbf24" : "#5eead4";

          return (
            <li key={unit.id} className="relative">
              {/* Encabezado de la zona; el sedal pasa por detrás del letrero */}
              <div className="relative z-10 flex items-start justify-between gap-4 px-4 pb-4 pt-6 sm:px-8">
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-1/2 -z-10 -translate-x-1/2"
                  style={
                    reached > 0
                      ? { width: 4, background: lineColor, boxShadow: `0 0 6px ${lineColor}` }
                      : { width: 0, borderLeft: "2px dashed rgb(255 255 255 / 0.22)" }
                  }
                />
                <div className="max-w-md rounded-2xl bg-[#020617]/40 p-4 ring-1 ring-white/10 backdrop-blur-sm">
                  <p className={`text-xs font-bold uppercase tracking-[0.14em] ${expert ? "text-[#fbbf24]" : "text-[#7dd3fc]"}`}>
                    {expert ? "Prueba final" : `Unidad ${u + 1}`} · {zone.name} · {zone.depth}
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl sm:text-3xl">{unit.title}</h2>
                  <p className="mt-1 text-sm text-white/75">
                    <span className={`mr-2 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${expert ? "bg-[#f59e0b] text-[#0a0f1c]" : "bg-white/15"}`}>
                      {unit.level}
                    </span>
                    {unit.description}
                  </p>
                </div>
                {zoneDone ? (
                  <span className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full bg-[#14b8a6]/25 px-3 py-1 text-xs font-semibold text-[#99f6e4]">
                    <ShieldCheck className="h-4 w-4" aria-hidden /> Zona superada
                  </span>
                ) : (
                  <span className="-mt-8 shrink-0" title="Anzuelos por descubrir en esta zona">
                    <Hook />
                  </span>
                )}
              </div>

              <div className="relative" style={{ height }}>
              {/* Sedal */}
              <svg
                viewBox={`0 0 100 ${height}`}
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden
              >
                <path d={curve(all)} fill="none" stroke="rgb(255 255 255 / 0.22)" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                {donePath && (
                  <path
                    d={donePath}
                    pathLength={1}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    className="dive-line-done drop-shadow-[0_0_6px_rgba(94,234,212,0.7)]"
                    style={{ "--len": 1 } as CSSProperties}
                  />
                )}
              </svg>

              {/* Lecciones */}
              {list.map((l, i) => {
                const [x, y] = pts[i];
                const right = x < 50; // la etiqueta va del lado con más espacio
                const node = (
                  <span
                    className={`relative grid place-items-center rounded-full transition-transform duration-200 ${
                      l.state === "done"
                        ? `h-16 w-16 ${expert ? "bg-[#f59e0b] text-[#0a0f1c]" : "bg-[#14b8a6] text-white"} ring-4 ring-white/15 group-hover:scale-110`
                        : l.state === "current"
                          ? "h-20 w-20 bg-white text-[#0a4d75] ring-4 ring-[#5eead4]/60 group-hover:scale-105"
                          : l.state === "area"
                            ? "h-16 w-16 bg-white/90 text-[#0a4d75] ring-4 ring-[#fbbf24]/70 group-hover:scale-105"
                            : "h-14 w-14 border border-white/15 bg-white/5 text-white/40"
                    }`}
                  >
                    {l.state === "current" && (
                      <>
                        <span className="dive-sonar absolute inset-0 rounded-full border-2 border-[#5eead4]" aria-hidden />
                        <span className="dive-sonar absolute inset-0 rounded-full border-2 border-[#5eead4] [animation-delay:1.1s]" aria-hidden />
                      </>
                    )}
                    {l.state === "done" ? (
                      <Check className="h-8 w-8" strokeWidth={3} aria-hidden />
                    ) : l.state === "current" || l.state === "area" ? (
                      <span className="font-display text-2xl">{start + i + 1}</span>
                    ) : (
                      <Lock className="h-5 w-5" strokeWidth={2} aria-hidden />
                    )}
                  </span>
                );
                return (
                  <div
                    key={l.id}
                    id={l.state === "current" ? "leccion-actual" : undefined}
                    className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 scroll-mt-40 items-center"
                    style={{ left: `${x}%`, top: y }}
                  >
                    {l.state === "current" && (
                      <span className={`absolute top-1/2 -translate-y-1/2 ${right ? "-left-16" : "-right-16 -scale-x-100"}`}>
                        <Fish />
                      </span>
                    )}
                    {l.href ? (
                      <Link
                        href={l.href}
                        className="group rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        aria-label={`Lección ${start + i + 1}: ${l.title}${l.state === "done" ? " (completada, repasar)" : ""}`}
                      >
                        {node}
                      </Link>
                    ) : (
                      <span aria-label={`Lección ${start + i + 1}: ${l.title} (bloqueada)`}>{node}</span>
                    )}
                    <span
                      className={`absolute top-1/2 w-[min(42vw,200px)] -translate-y-1/2 ${right ? "left-full pl-4 text-left" : "right-full pr-4 text-right"}`}
                    >
                      <span className={`block font-semibold leading-tight ${l.state === "locked" ? "text-white/45" : "text-white"}`}>
                        {l.title}
                      </span>
                      <span className="text-xs text-white/60">
                        {l.state === "current"
                          ? loggedIn
                            ? `${l.questions} preguntas · ¡bucea!`
                            : "Crea tu cuenta para empezar"
                          : l.state === "done"
                            ? "Repasar"
                            : l.state === "area"
                              ? `De tu área · ${l.questions} preguntas`
                              : `${l.questions} preguntas`}
                      </span>
                    </span>
                  </div>
                );
              })}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Fondo marino */}
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="relative block h-16 w-full text-[#01030b]" aria-hidden>
        <path d="M0 80 V50 Q 80 20 160 45 T 320 40 Q 400 10 480 42 T 640 38 Q 720 20 800 46 T 960 40 Q 1040 18 1120 44 L 1200 36 V80 Z" fill="currentColor" />
      </svg>
    </div>
  );
}
