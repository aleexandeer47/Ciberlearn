"use client";

import { Heart, Skull } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { answerExercise, completeLesson, serveBossQuestion, startLesson, type AnswerResult, type CompleteResult } from "@/app/actions/path";
import { useLang, useT } from "@/components/i18n/LangProvider";
import type { LivesView } from "@/lib/lives";
import { BOSS, type ExerciseChoice, type PublicExercise } from "@/lib/path/content";
import { sfx } from "@/lib/sfx";
import { creatureFor, LEVIATHAN } from "./Creatures";
import { DepthCinematic } from "./DepthCinematic";
import { Hearts } from "./Hearts";
import { ZONES } from "./DiveMap";

/*
 * La batalla final contra el Leviatán, en el fondo de la Fosa de las Marianas.
 * Cada pregunta tiene BOSS.seconds segundos (el servidor mide el tiempo). Acertar esquiva su ataque y
 * le quita vida; fallar o no responder a tiempo te quita una de tus BOSS.hearts vidas de batalla.
 */

type Phase = "intro" | "loading" | "question" | "resolving" | "won" | "lost" | "no-lives" | "error";
type Outcome = { correct: boolean; timedOut: boolean; explain: string; id: string } | null;

/** Lo que la batalla necesita del servidor (se puede reemplazar en una vista de prueba). */
export interface BossApi {
  start: typeof startLesson;
  serve: typeof serveBossQuestion;
  answer: typeof answerExercise;
  complete: typeof completeLesson;
}
const SERVER_API: BossApi = { start: startLesson, serve: serveBossQuestion, answer: answerExercise, complete: completeLesson };

interface Props {
  lesson: { id: string; title: string; exercises: PublicExercise[] };
  initialLives: LivesView;
  api?: BossApi;
}

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export function BossFight({ lesson, initialLives, api = SERVER_API }: Props) {
  const lang = useLang();
  const t = useT();
  const [phase, setPhase] = useState<Phase>("intro");
  const [order, setOrder] = useState<string[]>([]);
  const [qi, setQi] = useState(0);
  const [bossHp, setBossHp] = useState<number>(BOSS.hp);
  const [hearts, setHearts] = useState<number>(BOSS.hearts);
  const [lives, setLives] = useState(initialLives);
  const [left, setLeft] = useState<number>(BOSS.seconds);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [mistakes, setMistakes] = useState<{ q: string; url: string; explain: string }[]>([]);
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [cine, setCine] = useState(false);
  // Para reiniciar las animaciones CSS en cada ataque
  const [beat, setBeat] = useState(0);
  const deadline = useRef(0);
  const answering = useRef(false);

  const byId = new Map(lesson.exercises.map((x) => [x.id, x]));
  const ex = order[qi] ? byId.get(order[qi]) : undefined;
  const q = ex && (ex.kind === "enlace" || ex.kind === "opcion") ? ex : null;
  const me = creatureFor(ZONES.length - 1);

  // ---------- Preguntas ----------
  const ask = useCallback(
    async (id: string) => {
      setPhase("loading");
      const r = await api.serve(lesson.id, id);
      if (!r.ok) {
        setPhase("error");
        return;
      }
      answering.current = false;
      deadline.current = performance.now() + BOSS.seconds * 1000;
      setLeft(BOSS.seconds);
      setOutcome(null);
      setPhase("question");
    },
    [api, lesson.id],
  );

  const begin = useCallback(async () => {
    sfx.roar();
    setPhase("loading");
    const r = await api.start(lesson.id);
    if (!r.ok) {
      if (r.error === "sin-vidas") {
        if (r.lives) setLives(r.lives);
        setPhase("no-lives");
      } else setPhase("error");
      return;
    }
    setLives(r.lives);
    const ids = shuffle(lesson.exercises.map((x) => x.id));
    setOrder(ids);
    setQi(0);
    setBossHp(BOSS.hp);
    setHearts(BOSS.hearts);
    setMistakes([]);
    await ask(ids[0]);
  }, [api, ask, lesson]);

  const resolve = useCallback(
    async (choice: ExerciseChoice) => {
      if (answering.current || !q) return;
      answering.current = true;
      setPhase("resolving");
      const r = await api.answer(lesson.id, q.id, choice);
      if (!r.ok) {
        if (r.error === "sin-vidas") {
          if (r.lives) setLives(r.lives);
          setPhase("no-lives");
        } else setPhase("error");
        return;
      }
      const res = r as AnswerResult;
      setLives(res.lives);
      setBeat((b) => b + 1);
      setOutcome({ correct: res.correct, timedOut: !!res.timedOut || choice === "timeout", explain: res.explain, id: q.id });
      let hp = bossHp;
      let h = hearts;
      if (res.correct) {
        sfx.strike();
        hp = bossHp - 1;
        setBossHp(hp);
      } else {
        sfx.hurt();
        h = hearts - 1;
        setHearts(h);
        setMistakes((m) => [...m, { q: q.prompt, url: q.context ?? "", explain: res.explain }]);
      }
      // Pausa para ver el golpe (más larga si fallaste, para leer por qué)
      window.setTimeout(
        async () => {
          if (hp <= 0) {
            const c = await api.complete(lesson.id);
            if (c.ok) {
              setResult(c);
              setPhase("won");
            } else setPhase("error");
            return;
          }
          if (h <= 0) {
            setPhase("lost");
            return;
          }
          const next = qi + 1;
          if (next >= order.length) {
            setPhase("lost");
            return;
          }
          setQi(next);
          await ask(order[next]);
        },
        res.correct ? 1300 : 2600,
      );
    },
    [api, ask, bossHp, hearts, lesson.id, order, q, qi],
  );

  // ---------- Reloj de 5 segundos ----------
  useEffect(() => {
    if (phase !== "question") return;
    let raf = 0;
    let lastSec: number = BOSS.seconds;
    const loop = () => {
      const ms = deadline.current - performance.now();
      const s = Math.max(0, ms / 1000);
      setLeft(s);
      const whole = Math.ceil(s);
      if (whole < lastSec && whole > 0) {
        lastSec = whole;
        sfx.tick(whole <= 2);
      }
      if (ms <= 0) {
        void resolve("timeout");
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, resolve]);

  // Teclado: ← o 1 = Real, → o 2 = Trampa
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "question") return;
      if (e.key === "ArrowLeft" || e.key === "1") resolve(0);
      if (e.key === "ArrowRight" || e.key === "2") resolve(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, resolve]);

  // ---------- Pantallas ----------
  const charge = phase === "question" ? 1 - left / BOSS.seconds : 0;
  const hit = outcome && phase === "resolving";

  if (cine) return <DepthCinematic mode="final" from={ZONES.length - 1} to={ZONES.length - 1} onClose={() => setCine(false)} />;

  return (
    <div className={`boss-arena relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden text-white ${hit && !outcome.correct ? "boss-shake" : ""}`} key={hit && !outcome.correct ? `s${beat}` : "arena"}>
      {/* Fondo: oscuridad, nieve marina y luz roja desde abajo */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {Array.from({ length: 26 }, (_, n) => (
          <span
            key={n}
            className="dive-snow absolute rounded-full bg-white/40"
            style={{ left: `${(n * 37) % 97}%`, top: `${(n * 53) % 100}%`, width: 1 + (n % 3), height: 1 + (n % 3), animationDelay: `${(n * 1.3) % 10}s` }}
          />
        ))}
      </div>
      {/* Ojos que miran desde la oscuridad */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {[[6, 30, 0.4], [86, 24, 2.1], [10, 62, 3.6], [90, 58, 1.2], [4, 86, 4.8], [94, 84, 2.9]].map(([l, tp, d], n) => (
          <span key={n} className="dive-eyes absolute flex gap-1.5" style={{ left: `${l}%`, top: `${tp}%`, animationDelay: `${d}s` }}>
            <i className="block h-1.5 w-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
            <i className="block h-1.5 w-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
          </span>
        ))}
      </div>
      {/* Viñeta y luz que parpadea como una lámpara a punto de apagarse */}
      <div className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_50%_45%,transparent_35%,rgba(0,0,0,0.85)_100%)]" aria-hidden />
      <div className="boss-flicker pointer-events-none absolute inset-0 z-[6] bg-black" aria-hidden />
      {hit && !outcome.correct && <div key={`f${beat}`} className="boss-flash pointer-events-none absolute inset-0 z-20 bg-[#dc2626]" aria-hidden />}

      {/* Barra del Leviatán */}
      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pt-5">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.25em] text-[#fca5a5]">
          <span className="flex items-center gap-2">
            <Skull className="h-4 w-4" aria-hidden /> {t("Leviatán", "Leviathan")}
          </span>
          <span className="tabular-nums">
            {bossHp}/{BOSS.hp}
          </span>
        </div>
        <div className="mt-2 flex gap-1" role="meter" aria-valuenow={bossHp} aria-valuemin={0} aria-valuemax={BOSS.hp} aria-label={t("Vida del Leviatán", "Leviathan's health")}>
          {Array.from({ length: BOSS.hp }, (_, i) => (
            <span
              key={i}
              className={`h-3 flex-1 rounded-sm transition-all duration-300 ${i < bossHp ? "bg-[#dc2626] shadow-[0_0_10px_#dc2626]" : "bg-white/10"}`}
            />
          ))}
        </div>
      </div>

      {/* El Leviatán */}
      <div className="relative z-0 flex justify-center pt-4">
        <div
          key={hit ? `b${beat}` : "boss"}
          className={`boss-body relative ${phase === "won" ? "boss-die" : hit ? (outcome.correct ? "boss-hurt" : "boss-lunge") : phase === "intro" ? "boss-emerge" : "boss-breathe"}`}
          style={{ filter: `drop-shadow(0 0 ${20 + charge * 50}px rgba(220,38,38,${0.4 + charge * 0.5})) brightness(${1 + charge * 0.6})` }}
        >
          <LEVIATHAN.Svg className="h-52 w-60 sm:h-72 sm:w-80" />
          {hit && outcome.correct && <span key={`x${beat}`} className="boss-slash absolute left-1/2 top-1/2 h-1.5 w-72 -translate-x-1/2 -translate-y-1/2 rotate-[-25deg] rounded-full bg-white shadow-[0_0_20px_white]" />}
        </div>
      </div>

      {/* Centro: intro, pregunta o resultado */}
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4">
        {phase === "intro" && (
          <div className="boss-rise text-center">
            <p className="font-display text-4xl text-[#ef4444] sm:text-6xl" style={{ textShadow: "0 0 24px rgba(239,68,68,0.8)" }}>
              {t("El Leviatán", "The Leviathan")}
            </p>
            <p className="mx-auto mt-4 max-w-md text-white/80">
              {t(
                `Despertaste a lo que vive en el fondo de la Fosa de las Marianas. Tiene ${BOSS.hp} de vida; tú tienes ${BOSS.hearts}.`,
                `You woke what lives at the bottom of the Mariana Trench. It has ${BOSS.hp} health; you have ${BOSS.hearts}.`,
              )}
            </p>
            <ul className="mx-auto mt-5 max-w-md space-y-2 text-left text-sm text-white/75">
              <li>⏱️ {t(`Cada pregunta: ${BOSS.seconds} segundos. Solo responde: ¿real o trampa?`, `Each question: ${BOSS.seconds} seconds. Just answer: real or scam?`)}</li>
              <li>🛡️ {t("Si aciertas, esquivas su ataque y lo hieres.", "Get it right and you dodge its attack and wound it.")}</li>
              <li>🩸 {t("Si fallas o se acaba el tiempo, te golpea.", "Get it wrong or run out of time and it hits you.")}</li>
            </ul>
            <button type="button" onClick={begin} className="btn mt-8 h-14 bg-[#dc2626] px-10 text-lg text-white hover:bg-[#b91c1c]">
              {t("Enfrentarlo", "Face it")}
            </button>
            <p className="mt-3 text-xs text-white/50">{t("Teclado: ← Real · → Trampa", "Keyboard: ← Real · → Scam")}</p>
          </div>
        )}

        {(phase === "question" || phase === "resolving" || phase === "loading") && q && (
          <div className="text-center">
            <p className="text-sm text-white/70">{q.prompt}</p>
            <p className="mx-auto mt-3 max-w-xl break-all rounded-2xl border border-white/15 bg-black/60 px-4 py-4 font-mono text-lg sm:text-xl">{q.context}</p>
            {/* Tiempo */}
            <div className="mx-auto mt-4 h-2.5 max-w-xl overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${left < 2 ? "bg-[#ef4444]" : "bg-[#fbbf24]"}`}
                style={{ width: `${phase === "question" ? (left / BOSS.seconds) * 100 : 0}%` }}
              />
            </div>
            <p className={`mt-1 font-mono text-sm tabular-nums ${left < 2 ? "text-[#ef4444]" : "text-white/60"}`}>{phase === "question" ? left.toFixed(1) : "0.0"} s</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {q.options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  disabled={phase !== "question"}
                  onClick={() => resolve(i)}
                  className={`h-16 rounded-2xl border-2 text-xl font-bold transition-transform active:scale-95 disabled:opacity-60 ${
                    i === 0 ? "border-[#22c55e] bg-[#052e16]/80 text-[#4ade80]" : "border-[#ef4444] bg-[#450a0a]/80 text-[#fca5a5]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="mt-4 min-h-12 text-sm">
              {phase === "resolving" && outcome && (
                <p className={outcome.correct ? "text-[#4ade80]" : "text-[#fca5a5]"}>
                  {outcome.correct
                    ? t("¡Esquivaste su ataque y lo heriste!", "You dodged its attack and wounded it!")
                    : outcome.timedOut
                      ? t("Se acabó el tiempo: te alcanzó. ", "Time's up: it got you. ")
                      : t("Te alcanzó. ", "It got you. ")}
                  {!outcome.correct && <span className="text-white/75">{outcome.explain}</span>}
                </p>
              )}
            </div>
          </div>
        )}

        {phase === "won" && result && (
          <div className="text-center">
            <p className="font-display text-4xl text-[#fecaca] sm:text-5xl">{t("¡Derrotaste al Leviatán!", "You defeated the Leviathan!")}</p>
            <p className="mt-3 text-white/75">
              {t(`Acertaste ${result.correct} de ${result.total} y ganaste`, `You got ${result.correct} of ${result.total} right and earned`)}{" "}
              <strong className="text-[#fde68a]">+{result.xp} XP</strong>.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => setCine(true)} className="btn h-12 bg-[#dc2626] px-6 text-white hover:bg-[#b91c1c]">
                {t("Ver tu transformación", "See your transformation")}
              </button>
              <Link href="/ruta" className="btn btn-ghost h-12 px-6">
                {t("Volver a la ruta", "Back to the path")}
              </Link>
            </div>
          </div>
        )}

        {phase === "lost" && (
          <div className="text-center">
            <p className="font-display text-4xl text-[#ef4444] sm:text-5xl">{t("El Leviatán te arrastró al fondo", "The Leviathan dragged you down")}</p>
            <p className="mt-3 text-white/75">{t("Repasa en qué te engañó y vuelve a enfrentarlo.", "Review what fooled you and face it again.")}</p>
            {mistakes.length > 0 && (
              <ul className="mx-auto mt-5 max-w-xl space-y-2 text-left text-sm">
                {mistakes.map((m, i) => (
                  <li key={i} className="rounded-xl border border-white/10 bg-black/50 p-3">
                    <span className="break-all font-mono text-[#fca5a5]">{m.url}</span>
                    <span className="mt-1 block text-white/75">{m.explain}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={begin} className="btn h-12 bg-[#dc2626] px-6 text-white hover:bg-[#b91c1c]">
                {t("Enfrentarlo otra vez", "Face it again")}
              </button>
              <Link href="/ruta" className="btn btn-ghost h-12 px-6">
                {t("Volver a la ruta", "Back to the path")}
              </Link>
            </div>
          </div>
        )}

        {phase === "no-lives" && (
          <div className="text-center">
            <p className="font-display text-3xl">{t("Te quedaste sin vidas", "You're out of lives")}</p>
            <div className="mt-4 flex justify-center">
              <Hearts lives={lives} />
            </div>
            <p className="mt-3 text-white/70">{t("Vuelven solas con el tiempo, o ten vidas infinitas con Pro.", "They come back on their own over time, or get unlimited lives with Pro.")}</p>
            <Link href="/ruta" className="btn btn-ghost mt-6 h-12 px-6">
              {t("Volver a la ruta", "Back to the path")}
            </Link>
          </div>
        )}

        {phase === "error" && (
          <div className="text-center">
            <p className="font-display text-2xl">{t("Algo salió mal", "Something went wrong")}</p>
            <Link href="/ruta" className="btn btn-primary mt-6 h-11 px-5">
              {t("Volver a la ruta", "Back to the path")}
            </Link>
          </div>
        )}
      </div>

      {/* Tú: tu pez y tus vidas de batalla */}
      <div className="relative z-10 mx-auto flex w-full max-w-2xl items-end justify-between px-4 pb-6">
        <div
          key={hit ? `p${beat}` : "me"}
          className={`h-14 w-24 ${hit ? (outcome.correct ? "fish-dodge" : "fish-hurt") : "dive-fish"}`}
          title={me.name[lang]}
        >
          <me.Svg className="h-full w-full" />
        </div>
        <div className="text-right">
          <div className="flex justify-end gap-1.5" aria-label={t(`${hearts} vidas de batalla`, `${hearts} battle lives`)}>
            {Array.from({ length: BOSS.hearts }, (_, i) => (
              <Heart key={i} className={`h-7 w-7 ${i < hearts ? "fill-[#ef4444] text-[#ef4444]" : "text-white/25"}`} strokeWidth={2} aria-hidden />
            ))}
          </div>
          {!lives.infinite && <p className="mt-1 text-xs text-white/50">{t(`Vidas de la ruta: ${lives.count}`, `Path lives: ${lives.count}`)}</p>}
        </div>
      </div>
    </div>
  );
}
