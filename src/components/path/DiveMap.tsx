import { Check, Lock, ShieldCheck, Skull } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { translator, type Lang } from "@/lib/i18n";
import { LEVEL_LABEL, type Unit } from "@/lib/path/content";
import { CREATURES, creatureFor, LEVIATHAN } from "./Creatures";

/*
 * La ruta como una inmersión: cada unidad es una zona del mar, más profunda (y difícil) que la anterior.
 * El sedal baja serpenteando por las lecciones; el tramo recorrido brilla y el pez marca dónde vas.
 * Phishing viene de “fishing” (pescar): aquí aprendes a reconocer los anzuelos.
 *
 * Sección 1 (el mar): de la superficie al abismo, donde tu pez se vuelve Kraken.
 * Sección 2 (las fosas): las zonas más profundas del planeta, hasta la Fosa de las Marianas y el Leviatán.
 */

/** Zonas en orden, con su profundidad real en metros (la usa también la cinemática de la inmersión). */
export const ZONES = [
  { name: { es: "Superficie", en: "Surface" }, depth: 0 },
  { name: { es: "Arrecife", en: "Reef" }, depth: 20 },
  { name: { es: "Bosque de algas", en: "Kelp forest" }, depth: 50 },
  { name: { es: "Mar abierto", en: "Open sea" }, depth: 120 },
  { name: { es: "Zona crepuscular", en: "Twilight zone" }, depth: 300 },
  { name: { es: "Corrientes frías", en: "Cold currents" }, depth: 700 },
  { name: { es: "Zona de medianoche", en: "Midnight zone" }, depth: 1500 },
  { name: { es: "El abismo", en: "The abyss" }, depth: 4000 },
  // Sección 2: las fosas
  { name: { es: "Llanura abisal", en: "Abyssal plain" }, depth: 5000 },
  { name: { es: "Zona hadal", en: "Hadal zone" }, depth: 6000 },
  { name: { es: "Fosa de Puerto Rico", en: "Puerto Rico Trench" }, depth: 8376 },
  { name: { es: "Fosa de Tonga", en: "Tonga Trench" }, depth: 10882 },
  { name: { es: "Fosa de las Marianas", en: "Mariana Trench" }, depth: 10935 },
] as const;

export const fmtDepth = (m: number) => `${m.toLocaleString("en-US")} m`;

export const zoneOf = (i: number, lang: Lang = "es") => {
  const z = ZONES[i];
  return z ? { name: z.name[lang], depth: fmtDepth(z.depth) } : { name: lang === "en" ? `Depth ${i + 1}` : `Profundidad ${i + 1}`, depth: "" };
};

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
  /** La batalla contra el Leviatán */
  boss?: boolean;
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

// Burbujas decorativas (posiciones fijas para que el servidor y el navegador coincidan)
const BUBBLES = [
  [8, 6, 0], [18, 4, 3], [30, 5, 6], [44, 3, 1.5], [57, 6, 4.5], [69, 4, 7], [81, 5, 2.5], [92, 3, 5.5],
  [12, 4, 8.5], [37, 5, 10], [63, 3, 9], [86, 4, 11],
] as const;

// Nieve marina de las fosas: restos que caen despacio desde arriba (posiciones fijas)
const SNOW = Array.from({ length: 34 }, (_, n) => [(n * 37) % 97, (n * 53) % 100, 1 + (n % 3), (n * 1.7) % 12] as const);

// Ojos que se abren en la oscuridad de la Fosa de las Marianas
const EYES = [
  [6, 18, 0], [88, 12, 2.3], [14, 52, 4.1], [82, 46, 1.2], [4, 82, 3.4], [92, 78, 5.2], [22, 92, 0.7], [72, 90, 2.9],
] as const;

/** Estilos de una zona según su sección (las fosas son más oscuras; las Marianas, rojas). */
function zoneStyle(u: number, s2Start: number, last: number) {
  if (u === last) return { line: "#ef4444", label: "text-[#fca5a5]", done: "bg-[#b91c1c] text-white", ring: "ring-[#ef4444]/60", glow: "rgba(239,68,68,0.75)" };
  if (u >= s2Start) return { line: "#a78bfa", label: "text-[#c4b5fd]", done: "bg-[#7c3aed] text-white", ring: "ring-[#a78bfa]/60", glow: "rgba(167,139,250,0.7)" };
  return null;
}

export function DiveMap({
  units,
  lessons,
  loggedIn,
  lang = "es",
  section2Start,
}: {
  units: Unit[];
  lessons: Map<string, DiveLesson>;
  loggedIn: boolean;
  lang?: Lang;
  /** Índice de la primera unidad de la sección 2 */
  section2Start: number;
}) {
  const t = translator(lang);
  const last = units.length - 1;
  // Índice global de la primera lección de cada zona
  const starts = units.map((_, u) => units.slice(0, u).reduce((a, x) => a + x.lessons.length, 0));
  const unitDone = (un: Unit) => un.lessons.every((l) => lessons.get(l.id)?.state === "done");
  const section1Done = units.slice(0, section2Start).every(unitDone);
  const allDone = units.every(unitDone);
  const Kraken = CREATURES[section2Start - 1];

  const renderUnit = (unit: Unit, u: number) => {
    const zone = zoneOf(u, lang);
    const expert = unit.level === "Experto";
    const trench = u >= section2Start;
    const zs = zoneStyle(u, section2Start, last);
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
    const lineColor = zs?.line ?? (expert ? "#fbbf24" : "#5eead4");
    // Evolución del pez en esta zona
    const creature = creatureFor(u);
    const zoneReached = reached > 0 || list.some((l) => l.state !== "locked");
    const finalTest = u === last;

    return (
      <li key={unit.id} className={`relative ${finalTest ? "dive-mariana" : ""}`}>
        {/* Fosa de las Marianas: oscuridad, luz roja y ojos que se abren */}
        {finalTest && (
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {EYES.map(([left, top, delay], n) => (
              <span
                key={n}
                className="dive-eyes absolute flex gap-1.5"
                style={{ left: `${left}%`, top: `${top}%`, "--delay": `${delay}s` } as CSSProperties}
              >
                <i className="block h-1.5 w-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
                <i className="block h-1.5 w-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
              </span>
            ))}
          </div>
        )}
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
          <div
            className={`max-w-md rounded-2xl p-4 ring-1 backdrop-blur-sm ${
              finalTest ? "bg-[#1a0505]/70 ring-[#ef4444]/40" : trench ? "bg-[#05030f]/60 ring-white/10" : "bg-[#020617]/40 ring-white/10"
            }`}
          >
            <p className={`text-xs font-bold uppercase tracking-[0.14em] ${zs?.label ?? (expert ? "text-[#fbbf24]" : "text-[#7dd3fc]")}`}>
              {finalTest
                ? t("Prueba final", "Final test")
                : expert
                  ? t("Prueba de la sección 1", "Section 1 test")
                  : t(`Unidad ${u + 1}`, `Unit ${u + 1}`)}{" "}
              · {zone.name} · {zone.depth}
            </p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl">{unit.title}</h2>
            <p className="mt-1 text-sm text-white/75">
              <span
                className={`mr-2 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${
                  finalTest ? "bg-[#dc2626] text-white" : expert ? "bg-[#f59e0b] text-[#0a0f1c]" : "bg-white/15"
                }`}
              >
                {LEVEL_LABEL[lang][unit.level]}
              </span>
              {unit.description}
            </p>
            {/* Etapa del pez en esta zona: se revela al llegar */}
            <p className="mt-3 flex items-center gap-2 text-xs text-white/70">
              <creature.Svg className={`h-6 w-9 shrink-0 ${zoneReached ? "" : "opacity-60 brightness-0 invert-[.35]"}`} />
              <span>
                {t("Tu pez aquí", "Your fish here")}:{" "}
                <strong className={zoneReached ? "text-white" : "text-white/50"}>{zoneReached ? creature.name[lang] : "???"}</strong>
              </span>
            </p>
          </div>
          {zoneDone ? (
            <span className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full bg-[#14b8a6]/25 px-3 py-1 text-xs font-semibold text-[#99f6e4]">
              <ShieldCheck className="h-4 w-4" aria-hidden /> {t("Zona superada", "Zone cleared")}
            </span>
          ) : (
            <span className="-mt-8 shrink-0" title={t("Anzuelos por descubrir en esta zona", "Hooks to discover in this zone")}>
              <Hook />
            </span>
          )}
        </div>

        <div className="relative" style={{ height }}>
          {/* Sedal */}
          <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <path d={curve(all)} fill="none" stroke="rgb(255 255 255 / 0.22)" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {donePath && (
              <path
                d={donePath}
                fill="none"
                stroke={lineColor}
                strokeWidth="4"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="dive-line-done"
                style={{ filter: `drop-shadow(0 0 6px ${zs?.glow ?? "rgba(94,234,212,0.7)"})` }}
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
                  l.boss
                    ? l.state === "done"
                      ? "h-20 w-20 bg-[#b91c1c] text-white ring-4 ring-[#ef4444]/50 group-hover:scale-110"
                      : l.state === "locked"
                        ? "h-[4.5rem] w-[4.5rem] border-2 border-[#7f1d1d] bg-[#1a0505] text-[#ef4444]/70"
                        : "dive-boss-node h-24 w-24 bg-[#1a0505] text-[#ef4444] ring-4 ring-[#ef4444]/70 group-hover:scale-105"
                    : l.state === "done"
                      ? `h-16 w-16 ${zs?.done ?? (expert ? "bg-[#f59e0b] text-[#0a0f1c]" : "bg-[#14b8a6] text-white")} ring-4 ring-white/15 group-hover:scale-110`
                      : l.state === "current"
                        ? `h-20 w-20 bg-white text-[#0a4d75] ring-4 ${zs?.ring ?? "ring-[#5eead4]/60"} group-hover:scale-105`
                        : l.state === "area"
                          ? "h-16 w-16 bg-white/90 text-[#0a4d75] ring-4 ring-[#fbbf24]/70 group-hover:scale-105"
                          : "h-14 w-14 border border-white/15 bg-white/5 text-white/40"
                }`}
              >
                {l.state === "current" && (
                  <>
                    <span className="dive-sonar absolute inset-0 rounded-full border-2" style={{ borderColor: lineColor }} aria-hidden />
                    <span className="dive-sonar absolute inset-0 rounded-full border-2 [animation-delay:1.1s]" style={{ borderColor: lineColor }} aria-hidden />
                  </>
                )}
                {l.boss ? (
                  l.state === "done" ? <Check className="h-9 w-9" strokeWidth={3} aria-hidden /> : <Skull className="h-9 w-9" strokeWidth={2} aria-hidden />
                ) : l.state === "done" ? (
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
                {l.state === "current" && !l.boss && (
                  <>
                    {/* Tableta y computadora: del lado contrario a la etiqueta, mirando hacia la lección */}
                    <span
                      title={creature.name[lang]}
                      className={`absolute top-1/2 hidden -translate-y-1/2 sm:block ${right ? "right-full mr-2" : `left-full ml-2 ${creature.front ? "" : "-scale-x-100"}`}`}
                    >
                      <creature.Svg className={`dive-fish ${creature.size} drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]`} />
                    </span>
                    {/* Celular: encima de la lección, para que las criaturas grandes no se salgan del mar */}
                    <span title={creature.name[lang]} className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 sm:hidden">
                      <creature.Svg className={`dive-fish ${creature.front ? "h-12 w-14" : "h-8 w-12"} drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]`} />
                    </span>
                  </>
                )}
                {l.href ? (
                  <Link
                    href={l.href}
                    className="group rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    aria-label={`${t("Lección", "Lesson")} ${start + i + 1}: ${l.title}${l.state === "done" ? t(" (completada, repasar)", " (completed, review)") : ""}`}
                  >
                    {node}
                  </Link>
                ) : (
                  <span aria-label={`${t("Lección", "Lesson")} ${start + i + 1}: ${l.title} ${t("(bloqueada)", "(locked)")}`}>{node}</span>
                )}
                <span className={`absolute top-1/2 w-[min(42vw,200px)] -translate-y-1/2 ${right ? "left-full pl-4 text-left" : "right-full pr-4 text-right"}`}>
                  <span className={`block font-semibold leading-tight ${l.boss ? "text-[#fca5a5]" : l.state === "locked" ? "text-white/45" : "text-white"}`}>
                    {l.title}
                  </span>
                  <span className="text-xs text-white/60">
                    {l.boss
                      ? l.state === "done"
                        ? t("Derrotado · repetir batalla", "Defeated · fight again")
                        : l.state === "locked"
                          ? t("Algo te espera en el fondo…", "Something waits at the bottom…")
                          : t("5 segundos por pregunta · ¡pelea!", "5 seconds per question · fight!")
                      : l.state === "current"
                        ? loggedIn
                          ? t(`${l.questions} preguntas · ¡bucea!`, `${l.questions} questions · dive in!`)
                          : t("Crea tu cuenta para empezar", "Sign up to start")
                        : l.state === "done"
                          ? t("Repasar", "Review")
                          : l.state === "area"
                            ? t(`De tu área · ${l.questions} preguntas`, `For your team · ${l.questions} questions`)
                            : t(`${l.questions} preguntas`, `${l.questions} questions`)}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </li>
    );
  };

  return (
    <div className="overflow-hidden rounded-[2rem] text-white shadow-[0_30px_80px_-40px_rgba(2,6,23,0.9)]">
      {/* ------------------------------------------------ Sección 1: el mar */}
      <div className="dive-sea relative overflow-hidden">
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

        <ol className="relative">{units.slice(0, section2Start).map((unit, u) => renderUnit(unit, u))}</ol>

        {section1Done && (
          <div className="relative z-10 flex flex-col items-center px-6 pb-6 pt-2 text-center">
            <Kraken.Svg className="dive-fish h-24 w-28 sm:h-28 sm:w-36" />
            <p className="mt-3 font-display text-2xl">{t("¡Llegaste al abismo: eres el Kraken!", "You reached the abyss: you’re the Kraken!")}</p>
            <p className="mt-1 max-w-md text-sm text-white/70">
              {t(
                "Pero el abismo no es el fondo. Debajo se abren las fosas más profundas del planeta… y algo vive allá abajo.",
                "But the abyss isn't the bottom. Below it open the deepest trenches on the planet… and something lives down there.",
              )}
            </p>
          </div>
        )}

        {/* Borde del abismo: el suelo se rompe y se abre la fosa */}
        <svg viewBox="0 0 1200 90" preserveAspectRatio="none" className="relative block h-20 w-full" aria-hidden>
          <path d="M0 90 V40 Q 120 20 240 44 T 420 38 L 470 60 L 500 90 Z" fill="#01030b" />
          <path d="M1200 90 V36 Q 1080 18 960 42 T 780 40 L 730 62 L 700 90 Z" fill="#01030b" />
        </svg>
      </div>

      {/* ------------------------------------------------ Sección 2: las fosas */}
      <div className="dive-trench relative overflow-hidden">
        {/* Paredes de la fosa que se cierran hacia el fondo */}
        <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <path d="M0 0 H8 L5 80 L11 170 L7 260 L13 360 L9 450 L15 560 L11 650 L17 760 L13 860 L19 1000 H0 Z" fill="#000" opacity="0.75" />
          <path d="M100 0 H92 L95 90 L89 180 L93 280 L87 370 L91 470 L85 580 L89 670 L83 780 L87 880 L81 1000 H100 Z" fill="#000" opacity="0.75" />
        </svg>
        {/* Nieve marina */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {SNOW.map(([left, top, size, delay], n) => (
            <span
              key={n}
              className="dive-snow absolute rounded-full bg-white/50"
              style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, "--delay": `${delay}s` } as CSSProperties}
            />
          ))}
        </div>

        {/* Letrero de la sección 2 */}
        <div className="relative z-10 px-6 pb-2 pt-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c4b5fd]">{t("Sección 2", "Section 2")}</p>
          <p className="mt-2 font-display text-3xl sm:text-4xl">{t("Las fosas", "The trenches")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/65">
            {section1Done
              ? t(
                  "5,000 a 10,935 metros. Estafas con IA, dinero, redes y trabajo. Al final, en la Fosa de las Marianas, te espera el Leviatán.",
                  "5,000 to 10,935 meters. AI, money, social media and job scams. At the very bottom, in the Mariana Trench, the Leviathan is waiting.",
                )
              : t("Termina la sección 1 para descender a las fosas.", "Finish section 1 to descend into the trenches.")}
          </p>
          {!section1Done && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
              <Lock className="h-3.5 w-3.5" aria-hidden /> {t("Bloqueada", "Locked")}
            </span>
          )}
        </div>

        <ol className="relative">{units.slice(section2Start).map((unit, i) => renderUnit(unit, section2Start + i))}</ol>

        {allDone && (
          <div className="relative z-10 flex flex-col items-center px-6 pb-6 pt-2 text-center">
            <LEVIATHAN.Svg className="dive-fish h-32 w-36 sm:h-40 sm:w-48" />
            <p className="mt-3 font-display text-2xl text-[#fecaca]">
              {t("Venciste al Leviatán. Ahora el fondo del planeta es tuyo.", "You defeated the Leviathan. The bottom of the planet is yours now.")}
            </p>
            <p className="mt-1 max-w-md text-sm text-white/70">
              {t(
                "10,935 metros. Del alevín de la superficie al Leviatán de las Marianas. Ya no hay anzuelo que te atrape.",
                "10,935 meters. From a tiny fry at the surface to the Leviathan of the Mariana Trench. No hook can catch you now.",
              )}
            </p>
          </div>
        )}

        {/* Fondo de la Fosa de las Marianas */}
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="relative block h-16 w-full text-black" aria-hidden>
          <path d="M0 80 V30 L 300 50 L 520 62 L 600 70 L 680 62 L 900 50 L 1200 30 V80 Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
