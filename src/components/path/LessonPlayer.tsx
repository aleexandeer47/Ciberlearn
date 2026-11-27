"use client";

import { ArrowRight, Check, HeartCrack, Mail, MessageSquare, Phone, Smartphone, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { answerExercise, completeLesson, startLesson, type AnswerResult, type CompleteResult } from "@/app/actions/path";
import { useLang, useT } from "@/components/i18n/LangProvider";
import { ListenButton } from "@/components/theme/SimpleMode";
import { SoundToggle } from "@/components/theme/SoundToggle";
import type { T } from "@/lib/i18n";
import type { ExerciseChoice, PublicExercise } from "@/lib/path/content";
import { fmtWait, type LivesView } from "@/lib/lives";
import { sfx } from "@/lib/sfx";
import { useCountUp } from "@/lib/useCountUp";
import { DepthCinematic } from "./DepthCinematic";
import { Hearts } from "./Hearts";

const CHANNEL_ICON = { Correo: Mail, SMS: MessageSquare, Chat: Smartphone, Llamada: Phone } as const;
const CHANNEL_LABEL = {
  es: { Correo: "Correo", SMS: "SMS", Chat: "Chat", Llamada: "Llamada" },
  en: { Correo: "Email", SMS: "Text message", Chat: "Chat", Llamada: "Phone call" },
} as const;

type Phase = "loading" | "playing" | "feedback" | "no-lives" | "done" | "error";

interface Props {
  lesson: { id: string; title: string; exercises: PublicExercise[] };
  initialLives: LivesView;
  /** Si esta lección cierra una zona: su índice (al terminarla se baja a la siguiente con la cinemática) */
  zone?: number;
}

export function LessonPlayer({ lesson, initialLives, zone }: Props) {
  // Cinemática de la inmersión al cerrar una zona por primera vez (y para volver a verla)
  const [cine, setCine] = useState(false);
  const [phase, setPhase] = useState<Phase>("loading");
  const [i, setI] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [choice, setChoice] = useState<ExerciseChoice | null>(null);
  // Selección en curso de los ejercicios interactivos (partes tocadas / pasos en orden)
  const [picks, setPicks] = useState<number[]>([]);
  const [fb, setFb] = useState<AnswerResult | null>(null);
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [busy, setBusy] = useState(false);
  const ex = lesson.exercises[i];
  const total = lesson.exercises.length;
  const xpShown = useCountUp(result?.xp ?? 0, 900, 0);
  const lang = useLang();
  const t = useT();

  useEffect(() => {
    startLesson(lesson.id).then((r) => {
      if (r.ok) {
        setLives(r.lives);
        setPhase("playing");
      } else if (r.error === "sin-vidas") {
        if (r.lives) setLives(r.lives);
        setPhase("no-lives");
      } else setPhase("error");
    });
  }, [lesson.id]);

  const submit = useCallback(
    async (c: ExerciseChoice) => {
      if (busy || phase !== "playing") return;
      setBusy(true);
      setChoice(c);
      const r = await answerExercise(lesson.id, ex.id, c);
      setBusy(false);
      if (!r.ok) {
        if (r.error === "sin-vidas") {
          if (r.lives) setLives(r.lives);
          setPhase("no-lives");
        } else setPhase("error");
        return;
      }
      if (r.correct) sfx.correct();
      else sfx.wrong();
      setFb(r);
      setLives(r.lives);
      setPhase("feedback");
    },
    [busy, phase, lesson.id, ex],
  );

  const next = useCallback(async () => {
    if (phase !== "feedback") return;
    if (!lives.infinite && lives.count <= 0) {
      setPhase("no-lives");
      return;
    }
    if (i + 1 < total) {
      setI(i + 1);
      setChoice(null);
      setPicks([]);
      setFb(null);
      setPhase("playing");
      return;
    }
    setBusy(true);
    const r = await completeLesson(lesson.id);
    setBusy(false);
    if (r.ok) {
      sfx.complete();
      setResult(r);
      setPhase("done");
      if (zone !== undefined && r.firstTime) window.setTimeout(() => setCine(true), 900);
    } else setPhase("error");
  }, [phase, lives, i, total, lesson.id, zone]);

  // Teclado: 1-4 elige, P/L en veredictos, Enter continúa
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (phase === "feedback" && e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (phase === "playing" && ex) {
        if (ex.kind === "veredicto") {
          if (e.key.toLowerCase() === "p") submit("phishing");
          if (e.key.toLowerCase() === "l") submit("legit");
        } else if (ex.kind === "senales" || ex.kind === "ordenar") {
          // Los números tocan/eligen; Enter comprueba
          const n = Number(e.key) - 1;
          const len = ex.kind === "senales" ? ex.parts.length : ex.items.length;
          if (n >= 0 && n < len) setPicks((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
          if (e.key === "Enter" && (ex.kind === "senales" || picks.length === ex.items.length)) {
            e.preventDefault();
            submit(picks);
          }
        } else {
          const n = Number(e.key) - 1;
          if (n >= 0 && n < ex.options.length) submit(n);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, ex, next, submit, picks]);

  if (phase === "no-lives") return <NoLives lives={lives} t={t} />;
  if (phase === "error")
    return (
      <Panel>
        <h1 className="font-display text-2xl">{t("Algo salió mal", "Something went wrong")}</h1>
        <p className="mt-2 text-fog">{t("Vuelve a la ruta e intenta de nuevo.", "Go back to the path and try again.")}</p>
        <Link href="/ruta" className="btn btn-primary mt-6 h-11 px-5">
          {t("Volver a la ruta", "Back to the path")}
        </Link>
      </Panel>
    );
  if (phase === "done" && result) {
    if (cine && zone !== undefined) return <DepthCinematic mode="zona" from={zone} to={zone + 1} onClose={() => setCine(false)} />;
    return (
      <Panel>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-field text-brand">
          <Sparkles className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="eyebrow mt-6">{t("Lección completada", "Lesson complete")}</span>
        <h1 className="mt-2 font-display text-3xl">{lesson.title}</h1>
        <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3">
          <div className="rounded-2xl border border-desk-line p-4">
            <p className="font-display text-4xl tabular-nums text-brand">+{xpShown}</p>
            <p className="text-sm text-fog">{t("XP ganado", "XP earned")}</p>
          </div>
          <div className="rounded-2xl border border-desk-line p-4">
            <p className="font-display text-4xl tabular-nums">
              {result.correct}/{result.total}
            </p>
            <p className="text-sm text-fog">{t("correctas", "correct")}</p>
          </div>
        </div>
        {!result.firstTime && (
          <p className="mt-4 text-sm text-fog">
            {t("Repaso: ganas la mitad de XP por lección repetida.", "Review: you earn half the XP for a repeated lesson.")}
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {result.nextLessonId ? (
            <Link href={`/ruta/${result.nextLessonId}`} className="btn btn-primary h-12 px-6">
              {t("Siguiente lección", "Next lesson")} <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </Link>
          ) : (
            <Link href="/ranking" className="btn btn-primary h-12 px-6">
              {t("Ver el ranking", "See the leaderboard")}
            </Link>
          )}
          <Link href="/ruta" className="btn btn-ghost h-12 px-6">
            {t("Volver a la ruta", "Back to the path")}
          </Link>
        </div>
        {zone !== undefined && (
          <button type="button" onClick={() => setCine(true)} className="mt-4 text-sm font-semibold text-brand hover:underline">
            {t("Ver la inmersión otra vez", "Watch the dive again")}
          </button>
        )}
      </Panel>
    );
  }

  const progress = ((phase === "feedback" ? i + 1 : i) / total) * 100;

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-2xl flex-col px-4 py-6 sm:px-6">
      {/* Barra superior */}
      <div className="flex items-center gap-4">
        <Link href="/ruta" className="grid h-9 w-9 place-items-center rounded-lg text-fog hover:bg-desk-3 hover:text-chalk" aria-label={t("Salir de la lección", "Leave the lesson")}>
          <X className="h-5 w-5" strokeWidth={2} />
        </Link>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-desk-3" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-ok transition-[width] duration-500 ease-[var(--ease-out)]" style={{ width: `${progress}%` }} />
        </div>
        <SoundToggle />
        <Hearts lives={lives} compact />
      </div>

      {phase === "loading" || !ex ? (
        <div className="mt-16 h-64 animate-pulse rounded-3xl bg-desk-3" />
      ) : (
        <div key={ex.id} className="reveal-item mt-10 flex-1">
          {ex.kind === "veredicto" ? (
            <>
              <p className="eyebrow">{t("¿Trampa o real?", "Scam or real?")}</p>
              <h1 className="mt-2 font-display text-2xl">{t("Revisa este mensaje", "Check this message")}</h1>
              <div className="preview-card mt-6 p-5">
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-ink-3">
                  <span className="flex items-center gap-2">
                    {(() => {
                      const I = CHANNEL_ICON[ex.channel];
                      return <I className="h-4 w-4" strokeWidth={1.75} aria-hidden />;
                    })()}
                    {CHANNEL_LABEL[lang][ex.channel]}
                  </span>
                  <ListenButton
                    key={ex.id}
                    text={`${CHANNEL_LABEL[lang][ex.channel]}. ${t("De", "From")}: ${ex.from}. ${ex.text}`}
                    className="text-ink-2"
                  />
                </div>
                <p className="mt-2 break-words font-mono text-[13px] text-ink-2">{ex.from}</p>
                <p className="mt-3 leading-relaxed text-ink">{ex.text}</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {(["phishing", "legit"] as const).map((c) => (
                  <Choice
                    key={c}
                    label={c === "phishing" ? t("Es trampa", "It's a scam") : t("Es real", "It's real")}
                    hint={c === "phishing" ? "P" : "L"}
                    state={stateOf(c, choice, fb)}
                    disabled={phase !== "playing" || busy}
                    onClick={() => submit(c)}
                  />
                ))}
              </div>
            </>
          ) : ex.kind === "senales" ? (
            <SignalsExercise
              ex={ex}
              picks={picks}
              answer={Array.isArray(fb?.answer) ? fb.answer : null}
              disabled={phase !== "playing" || busy}
              onToggle={(n) => setPicks((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]))}
              onCheck={() => submit(picks)}
              t={t}
              channelLabel={CHANNEL_LABEL[lang][ex.channel]}
            />
          ) : ex.kind === "ordenar" ? (
            <OrderExercise
              ex={ex}
              picks={picks}
              answer={Array.isArray(fb?.answer) ? fb.answer : null}
              disabled={phase !== "playing" || busy}
              onToggle={(n) => setPicks((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]))}
              onCheck={() => submit(picks)}
              t={t}
            />
          ) : (
            <>
              <p className="eyebrow">{ex.kind === "enlace" ? t("Lee el enlace", "Read the link") : t("Elige la respuesta", "Choose the answer")}</p>
              <h1 className="mt-2 font-display text-2xl leading-snug">{ex.prompt}</h1>
              <ListenButton
                key={ex.id}
                text={`${ex.prompt} ${ex.context ? `${t("Enlace", "Link")}: ${ex.context}. ` : ""}${t("Opciones", "Options")}: ${ex.options.map((o, n) => `${n + 1}: ${o}`).join(". ")}`}
                className="mt-3 text-fog"
              />
              {ex.context && (
                <p className="mt-4 break-all rounded-xl bg-desk-3 px-4 py-3 font-mono text-sm">{ex.context}</p>
              )}
              <div className="mt-6 grid gap-3">
                {ex.options.map((opt, n) => (
                  <Choice
                    key={n}
                    label={opt}
                    hint={String(n + 1)}
                    mono={ex.kind === "enlace"}
                    state={stateOf(n, choice, fb)}
                    disabled={phase !== "playing" || busy}
                    onClick={() => submit(n)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Hoja de resultado */}
      {phase === "feedback" && fb && (
        <div
          className={`reveal-item sticky bottom-0 -mx-4 mt-8 border-t px-4 py-5 sm:-mx-6 sm:rounded-t-3xl sm:px-6 ${
            fb.correct ? "border-ok/30 bg-ok-soft" : "border-bad/30 bg-bad-soft"
          }`}
        >
          <div className="flex items-start gap-3 text-ink">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-white ${fb.correct ? "bg-ok" : "bg-bad"}`}>
              {fb.correct ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <HeartCrack className="h-5 w-5" strokeWidth={2} />}
            </span>
            <div className="flex-1">
              <p className={`font-semibold ${fb.correct ? "text-ok" : "text-[#b91c1c]"}`}>
                {fb.correct ? t("Correcto", "Correct") : lives.infinite ? t("Incorrecto", "Incorrect") : t("Incorrecto: pierdes una vida", "Incorrect: you lose a life")}
              </p>
              <p className="mt-1 text-[15px] leading-relaxed">{fb.explain}</p>
            </div>
          </div>
          <button type="button" onClick={next} disabled={busy} className={`btn mt-4 h-12 w-full ${fb.correct ? "btn-ok" : "btn-danger"}`}>
            {i + 1 < total ? t("Continuar", "Continue") : t("Terminar lección", "Finish lesson")} <kbd className="hidden sm:inline">Enter</kbd>
          </button>
        </div>
      )}
    </div>
  );
}

type ChoiceState = "idle" | "picked-right" | "picked-wrong" | "was-right";

/** "Toca las señales": el mensaje viene en partes y se tocan todas las sospechosas (o ninguna). */
function SignalsExercise({
  ex,
  picks,
  answer,
  disabled,
  onToggle,
  onCheck,
  t,
  channelLabel,
}: {
  ex: Extract<PublicExercise, { kind: "senales" }>;
  picks: number[];
  /** Índices correctos (después de responder) */
  answer: number[] | null;
  disabled: boolean;
  onToggle: (n: number) => void;
  onCheck: () => void;
  t: T;
  channelLabel: string;
}) {
  const I = CHANNEL_ICON[ex.channel];
  return (
    <>
      <p className="eyebrow">{t("Toca las señales", "Tap the signs")}</p>
      <h1 className="mt-2 font-display text-2xl leading-snug">{t("Toca todas las partes sospechosas", "Tap every suspicious part")}</h1>
      <p className="mt-1 text-sm text-fog">{t("Si es un mensaje real, no toques nada.", "If it's a real message, don't tap anything.")}</p>
      <div className="preview-card mt-6 p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-ink-3">
          <span className="flex items-center gap-2">
            <I className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {channelLabel}
          </span>
          <ListenButton key={ex.id} text={`${channelLabel}. ${ex.from}. ${ex.parts.join(" ")}`} className="text-ink-2" />
        </div>
        <p className="mt-2 break-words font-mono text-[13px] text-ink-2">{ex.from}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ex.parts.map((part, n) => {
            const on = picks.includes(n);
            const bad = answer?.includes(n);
            // Después de responder: verde = bien marcada, ámbar = se te pasó, rojo = no era sospechosa
            const cls = answer
              ? bad && on
                ? "border-ok bg-ok-soft"
                : bad
                  ? "border-[#f59e0b] bg-[#fef3c7] border-dashed"
                  : on
                    ? "border-bad bg-bad-soft line-through decoration-bad/60"
                    : "border-transparent bg-black/5"
              : on
                ? "border-[#f59e0b] bg-[#fde68a]"
                : "border-line bg-white hover:border-brand";
            return (
              <button
                key={n}
                type="button"
                aria-pressed={on}
                disabled={disabled}
                onClick={() => onToggle(n)}
                className={`rounded-xl border-2 px-3 py-2 text-left text-[15px] leading-snug text-ink transition-colors disabled:cursor-default ${cls}`}
              >
                {part}
              </button>
            );
          })}
        </div>
      </div>
      {!answer && (
        <button type="button" onClick={onCheck} disabled={disabled} className="btn btn-primary mt-6 h-12 w-full">
          {picks.length === 0
            ? t("No veo nada sospechoso", "I don't see anything suspicious")
            : t(`Comprobar (${picks.length} marcadas)`, `Check (${picks.length} marked)`)}
        </button>
      )}
      {answer && (
        <p className="mt-3 text-xs text-fog">
          {t("Verde: bien marcada · ámbar con línea: se te pasó · tachada: no era sospechosa.", "Green: correctly marked · dashed amber: you missed it · crossed out: it wasn't suspicious.")}
        </p>
      )}
    </>
  );
}

/** "Ordena los pasos": se tocan los pasos en el orden correcto (tocar otra vez lo quita). */
function OrderExercise({
  ex,
  picks,
  answer,
  disabled,
  onToggle,
  onCheck,
  t,
}: {
  ex: Extract<PublicExercise, { kind: "ordenar" }>;
  picks: number[];
  answer: number[] | null;
  disabled: boolean;
  onToggle: (n: number) => void;
  onCheck: () => void;
  t: T;
}) {
  const done = picks.length === ex.items.length;
  return (
    <>
      <p className="eyebrow">{t("Ordena los pasos", "Put the steps in order")}</p>
      <h1 className="mt-2 font-display text-2xl leading-snug">{ex.prompt}</h1>
      <p className="mt-1 text-sm text-fog">{t("Toca los pasos en orden. Tócalo otra vez para quitarlo.", "Tap the steps in order. Tap again to remove one.")}</p>
      <ListenButton key={ex.id} text={`${ex.prompt} ${ex.items.join(". ")}`} className="mt-3 text-fog" />
      <ul className="mt-6 grid gap-3">
        {ex.items.map((item, n) => {
          const pos = picks.indexOf(n);
          const rightPos = answer ? answer.indexOf(n) : -1;
          const ok = answer && pos === rightPos;
          return (
            <li key={n}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onToggle(n)}
                className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] disabled:cursor-default ${
                  answer ? (ok ? "border-ok bg-ok-soft text-ink" : "border-bad bg-bad-soft text-ink") : pos >= 0 ? "border-brand bg-field" : "border-desk-line bg-desk-2 hover:border-brand"
                }`}
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-bold ${
                    pos >= 0 ? "bg-brand text-white" : "border border-current/25 text-fog"
                  }`}
                >
                  {pos >= 0 ? pos + 1 : "·"}
                </span>
                <span className="flex-1 font-medium">{item}</span>
                {answer && !ok && (
                  <span className="shrink-0 rounded-full bg-ok px-2 py-0.5 text-xs font-bold text-white">
                    {t("va", "goes")} {rightPos + 1}.º
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {!answer && (
        <button type="button" onClick={onCheck} disabled={disabled || !done} className="btn btn-primary mt-6 h-12 w-full disabled:opacity-50">
          {done ? t("Comprobar el orden", "Check the order") : t(`Elige ${ex.items.length - picks.length} más`, `Pick ${ex.items.length - picks.length} more`)}
        </button>
      )}
    </>
  );
}

function stateOf(value: string | number, choice: ExerciseChoice | null, fb: AnswerResult | null): ChoiceState {
  if (!fb) return "idle";
  if (value === fb.answer) return value === choice ? "picked-right" : "was-right";
  if (value === choice) return "picked-wrong";
  return "idle";
}

function Choice({
  label,
  hint,
  state,
  disabled,
  mono = false,
  onClick,
}: {
  label: string;
  hint: string;
  state: ChoiceState;
  disabled: boolean;
  mono?: boolean;
  onClick: () => void;
}) {
  const tone =
    state === "picked-right" || state === "was-right"
      ? "border-ok bg-ok-soft text-ink"
      : state === "picked-wrong"
        ? "border-bad bg-bad-soft text-ink"
        : "border-desk-line bg-desk-2 hover:border-brand hover:bg-field";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] disabled:cursor-default ${tone}`}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-current/20 font-mono text-xs opacity-70">{hint}</span>
      <span className={`flex-1 ${mono ? "break-all font-mono text-sm" : "font-medium"}`}>{label}</span>
    </button>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="reveal-item mx-auto max-w-lg px-4 py-16 text-center">{children}</div>;
}

function NoLives({ lives, t }: { lives: LivesView; t: T }) {
  return (
    <Panel>
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-bad-soft text-bad">
        <HeartCrack className="h-8 w-8" strokeWidth={1.75} aria-hidden />
      </span>
      <h1 className="mt-6 font-display text-3xl">{t("Te quedaste sin vidas", "You're out of lives")}</h1>
      <p className="mt-3 text-fog">
        {lives.nextInMs !== null
          ? t(
              `Recuperas una vida en ${fmtWait(lives.nextInMs)} y todas en ${fmtWait(lives.fullInMs ?? 0)}.`,
              `You get a life back in ${fmtWait(lives.nextInMs)} and all of them in ${fmtWait(lives.fullInMs ?? 0)}.`,
            )
          : t("Vuelve en un rato.", "Come back in a while.")}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/planes" className="btn btn-primary h-12 px-6">
          {t("Vidas infinitas con Pro", "Unlimited lives with Pro")}
        </Link>
        <Link href="/ruta" className="btn btn-ghost h-12 px-6">
          {t("Volver a la ruta", "Back to the path")}
        </Link>
      </div>
      <p className="mt-6 text-sm text-fog">
        {t("Mientras tanto puedes practicar en el simulador clásico, que no usa vidas.", "Meanwhile you can practice in the classic simulator, which doesn't use lives.")}
      </p>
    </Panel>
  );
}
