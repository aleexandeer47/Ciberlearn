"use client";

import { ArrowRight, Check, HeartCrack, Mail, MessageSquare, Phone, Smartphone, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { answerExercise, completeLesson, startLesson, type AnswerResult, type CompleteResult } from "@/app/actions/path";
import { ListenButton } from "@/components/theme/SimpleMode";
import type { PublicExercise } from "@/lib/path/content";
import { fmtWait, type LivesView } from "@/lib/lives";
import { useCountUp } from "@/lib/useCountUp";
import { Hearts } from "./Hearts";

const CHANNEL_ICON = { Correo: Mail, SMS: MessageSquare, Chat: Smartphone, Llamada: Phone } as const;

type Phase = "loading" | "playing" | "feedback" | "no-lives" | "done" | "error";

interface Props {
  lesson: { id: string; title: string; exercises: PublicExercise[] };
  initialLives: LivesView;
}

export function LessonPlayer({ lesson, initialLives }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [i, setI] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [choice, setChoice] = useState<string | number | null>(null);
  const [fb, setFb] = useState<AnswerResult | null>(null);
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [busy, setBusy] = useState(false);
  const ex = lesson.exercises[i];
  const total = lesson.exercises.length;
  const xpShown = useCountUp(result?.xp ?? 0, 900, 0);

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
    async (c: string | number) => {
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
      setFb(null);
      setPhase("playing");
      return;
    }
    setBusy(true);
    const r = await completeLesson(lesson.id);
    setBusy(false);
    if (r.ok) {
      setResult(r);
      setPhase("done");
    } else setPhase("error");
  }, [phase, lives, i, total, lesson.id]);

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
        } else {
          const n = Number(e.key) - 1;
          if (n >= 0 && n < ex.options.length) submit(n);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, ex, next, submit]);

  if (phase === "no-lives") return <NoLives lives={lives} />;
  if (phase === "error")
    return (
      <Panel>
        <h1 className="font-display text-2xl">Algo salió mal</h1>
        <p className="mt-2 text-fog">Vuelve a la ruta e intenta de nuevo.</p>
        <Link href="/ruta" className="btn btn-primary mt-6 h-11 px-5">
          Volver a la ruta
        </Link>
      </Panel>
    );
  if (phase === "done" && result) {
    return (
      <Panel>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-field text-brand">
          <Sparkles className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="eyebrow mt-6">Lección completada</span>
        <h1 className="mt-2 font-display text-3xl">{lesson.title}</h1>
        <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3">
          <div className="rounded-2xl border border-desk-line p-4">
            <p className="font-display text-4xl tabular-nums text-brand">+{xpShown}</p>
            <p className="text-sm text-fog">XP ganado</p>
          </div>
          <div className="rounded-2xl border border-desk-line p-4">
            <p className="font-display text-4xl tabular-nums">
              {result.correct}/{result.total}
            </p>
            <p className="text-sm text-fog">correctas</p>
          </div>
        </div>
        {!result.firstTime && <p className="mt-4 text-sm text-fog">Repaso: ganas la mitad de XP por lección repetida.</p>}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {result.nextLessonId ? (
            <Link href={`/ruta/${result.nextLessonId}`} className="btn btn-primary h-12 px-6">
              Siguiente lección <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </Link>
          ) : (
            <Link href="/ranking" className="btn btn-primary h-12 px-6">
              Ver el ranking
            </Link>
          )}
          <Link href="/ruta" className="btn btn-ghost h-12 px-6">
            Volver a la ruta
          </Link>
        </div>
      </Panel>
    );
  }

  const progress = ((phase === "feedback" ? i + 1 : i) / total) * 100;

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-2xl flex-col px-4 py-6 sm:px-6">
      {/* Barra superior */}
      <div className="flex items-center gap-4">
        <Link href="/ruta" className="grid h-9 w-9 place-items-center rounded-lg text-fog hover:bg-desk-3 hover:text-chalk" aria-label="Salir de la lección">
          <X className="h-5 w-5" strokeWidth={2} />
        </Link>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-desk-3" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-ok transition-[width] duration-500 ease-[var(--ease-out)]" style={{ width: `${progress}%` }} />
        </div>
        <Hearts lives={lives} compact />
      </div>

      {phase === "loading" || !ex ? (
        <div className="mt-16 h-64 animate-pulse rounded-3xl bg-desk-3" />
      ) : (
        <div key={ex.id} className="reveal-item mt-10 flex-1">
          {ex.kind === "veredicto" ? (
            <>
              <p className="eyebrow">¿Trampa o real?</p>
              <h1 className="mt-2 font-display text-2xl">Revisa este mensaje</h1>
              <div className="preview-card mt-6 p-5">
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-ink-3">
                  <span className="flex items-center gap-2">
                    {(() => {
                      const I = CHANNEL_ICON[ex.channel];
                      return <I className="h-4 w-4" strokeWidth={1.75} aria-hidden />;
                    })()}
                    {ex.channel}
                  </span>
                  <ListenButton key={ex.id} text={`${ex.channel}. De: ${ex.from}. ${ex.text}`} className="text-ink-2" />
                </div>
                <p className="mt-2 break-words font-mono text-[13px] text-ink-2">{ex.from}</p>
                <p className="mt-3 leading-relaxed text-ink">{ex.text}</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {(["phishing", "legit"] as const).map((c) => (
                  <Choice
                    key={c}
                    label={c === "phishing" ? "Es trampa" : "Es real"}
                    hint={c === "phishing" ? "P" : "L"}
                    state={stateOf(c, choice, fb)}
                    disabled={phase !== "playing" || busy}
                    onClick={() => submit(c)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">{ex.kind === "enlace" ? "Lee el enlace" : "Elige la respuesta"}</p>
              <h1 className="mt-2 font-display text-2xl leading-snug">{ex.prompt}</h1>
              <ListenButton
                key={ex.id}
                text={`${ex.prompt} ${ex.context ? `Enlace: ${ex.context}. ` : ""}Opciones: ${ex.options.map((o, n) => `${n + 1}: ${o}`).join(". ")}`}
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
                {fb.correct ? "Correcto" : lives.infinite ? "Incorrecto" : "Incorrecto: pierdes una vida"}
              </p>
              <p className="mt-1 text-[15px] leading-relaxed">{fb.explain}</p>
            </div>
          </div>
          <button type="button" onClick={next} disabled={busy} className={`btn mt-4 h-12 w-full ${fb.correct ? "btn-ok" : "btn-danger"}`}>
            {i + 1 < total ? "Continuar" : "Terminar lección"} <kbd className="hidden sm:inline">Enter</kbd>
          </button>
        </div>
      )}
    </div>
  );
}

type ChoiceState = "idle" | "picked-right" | "picked-wrong" | "was-right";

function stateOf(value: string | number, choice: string | number | null, fb: AnswerResult | null): ChoiceState {
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

function NoLives({ lives }: { lives: LivesView }) {
  return (
    <Panel>
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-bad-soft text-bad">
        <HeartCrack className="h-8 w-8" strokeWidth={1.75} aria-hidden />
      </span>
      <h1 className="mt-6 font-display text-3xl">Te quedaste sin vidas</h1>
      <p className="mt-3 text-fog">
        {lives.nextInMs !== null
          ? `Recuperas una vida en ${fmtWait(lives.nextInMs)} y todas en ${fmtWait(lives.fullInMs ?? 0)}.`
          : "Vuelve en un rato."}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/planes" className="btn btn-primary h-12 px-6">
          Vidas infinitas con Pro
        </Link>
        <Link href="/ruta" className="btn btn-ghost h-12 px-6">
          Volver a la ruta
        </Link>
      </div>
      <p className="mt-6 text-sm text-fog">Mientras tanto puedes practicar en el simulador clásico, que no usa vidas.</p>
    </Panel>
  );
}
