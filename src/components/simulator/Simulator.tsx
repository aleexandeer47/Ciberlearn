"use client";

import { Flame, Mail, MessageSquare, Smartphone } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RunInput } from "@/app/actions/runs";
import { useLang, useT } from "@/components/i18n/LangProvider";
import { channelLabels } from "@/lib/scenarios/categories";
import { segmentScenario } from "@/lib/scenarios/segment";
import type { Inline, Scenario, Verdict } from "@/lib/scenarios/types";
import { scoreScenario, type ScenarioResult } from "@/lib/scoring";
import type { RunMode } from "@/lib/server/models";
import { sfx } from "@/lib/sfx";
import { useCountUp } from "@/lib/useCountUp";
import { MessageView } from "./MessageView";
import { ResultPanel } from "./ResultPanel";
import { Summary } from "./Summary";

const CHANNEL_ICON = { email: Mail, sms: MessageSquare, chat: Smartphone } as const;
const text = (x: Inline) => (typeof x === "string" ? x : x.t);
const EMPTY: ReadonlySet<string> = new Set();

interface Props {
  scenarios: Scenario[];
  mode?: RunMode;
  /** Segundos por mensaje (modo contrarreloj) */
  seconds?: number;
}

export function Simulator({ scenarios, mode = "clasico", seconds }: Props) {
  const lang = useLang();
  const t = useT();
  const DIFFICULTY = ["", t("Fácil", "Easy"), t("Media", "Medium"), t("Difícil", "Hard")];
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [verdicts, setVerdicts] = useState<(Verdict | null)[]>([]);
  const [times, setTimes] = useState<number[]>([]);
  const [marks, setMarks] = useState<Set<string>[]>([]);
  const [view, setView] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [remaining, setRemaining] = useState(seconds ?? 0);
  const startedAt = useRef(0);

  const active = results.length;
  const scenario = scenarios[view];
  const segmented = useMemo(() => segmentScenario(scenario), [scenario]);
  const signalNumbers = useMemo(() => new Map(scenario.signals.map((s, i) => [s.id, i + 1])), [scenario]);
  const marked = marks[view] ?? EMPTY;
  const result = results[view];
  const revealed = result !== undefined;
  const reviewing = revealed && view < active - 1;

  const total = results.reduce((acc, r) => acc + r.points, 0);
  const shownTotal = useCountUp(total);
  let streak = 0;
  for (let i = results.length - 1; i >= 0 && results[i].verdictCorrect; i--) streak++;

  const stamped = revealed ? (verdicts[view] ?? "timeout") : undefined;

  const toggle = (key: string) => {
    if (revealed) return;
    if (marked.has(key)) sfx.unmark();
    else sfx.mark();
    setMarks((prev) => {
      const copy = [...prev];
      const next = new Set(copy[view] ?? []);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      copy[view] = next;
      return copy;
    });
  };

  const decide = useCallback(
    (verdict: Verdict | null) => {
      if (revealed || view !== active) return;
      const r = scoreScenario(scenario, segmented, marked, verdict);
      if (r.verdictCorrect) sfx.correct(streak + 1);
      else sfx.wrong();
      setResults((prev) => [...prev, r]);
      setVerdicts((prev) => [...prev, verdict]);
      setTimes((prev) => [...prev, Math.round(performance.now() - startedAt.current)]);
    },
    [revealed, view, active, scenario, segmented, marked, streak],
  );

  // El reloj llama siempre a la versión más reciente de decide (con las marcas actuales).
  const decideRef = useRef(decide);
  useEffect(() => {
    decideRef.current = decide;
  }, [decide]);

  // Reloj: arranca cada vez que se abre un mensaje sin responder.
  useEffect(() => {
    if (revealed || view !== active) return;
    startedAt.current = performance.now();
    if (!seconds) return;
    const id = setInterval(() => {
      const left = Math.max(0, seconds - (performance.now() - startedAt.current) / 1000);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        decideRef.current(null);
      }
    }, 100);
    return () => clearInterval(id);
  }, [view, active, revealed, seconds]);

  const next = useCallback(() => {
    if (view === scenarios.length - 1) {
      sfx.complete();
      setShowSummary(true);
    } else {
      setView(active);
      if (seconds) setRemaining(seconds);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view, active, scenarios.length, seconds]);

  const restart = () => {
    setResults([]);
    setVerdicts([]);
    setTimes([]);
    setMarks([]);
    setView(0);
    setShowSummary(false);
    if (seconds) setRemaining(seconds);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, button, a, [role=button]")) return;
      const k = e.key.toLowerCase();
      if (!revealed && k === "p") decide("phishing");
      else if (!revealed && k === "l") decide("legit");
      else if (revealed && !reviewing && (k === "enter" || k === "arrowright")) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, reviewing, decide, next]);

  if (showSummary) {
    const run: RunInput = {
      mode,
      answers: scenarios.map((s, i) => ({
        scenarioId: s.id,
        marked: [...(marks[i] ?? [])],
        verdict: verdicts[i] ?? null,
        timeMs: times[i],
      })),
    };
    return <Summary scenarios={scenarios} results={results} run={run} onRestart={restart} />;
  }

  const timePct = seconds ? (remaining / seconds) * 100 : 0;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <p className="mb-3 px-2 font-mono text-[11px] text-fog">{t("Bandeja", "Inbox")} · {scenarios.length}</p>
          <ul className="space-y-1">
            {scenarios.map((s, i) => {
              const r = results[i];
              const locked = i > active;
              const current = i === view;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => setView(i)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-150 disabled:cursor-not-allowed ${
                      current ? "bg-desk-3 text-chalk" : locked ? "text-fog/35" : "text-fog hover:bg-desk-2 hover:text-chalk"
                    }`}
                  >
                    <span aria-hidden className="grid w-5 place-items-center">
                      {locked ? (
                        <span className="h-1 w-1 rounded-full bg-current" />
                      ) : (
                        (() => {
                          const I = CHANNEL_ICON[s.channel];
                          return <I className="h-4 w-4" strokeWidth={1.5} />;
                        })()
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{locked ? t("Mensaje sin abrir", "Unopened message") : text(s.from.name)}</span>
                    {r && (
                      <span
                        aria-label={r.verdictCorrect ? t("acertado", "correct") : t("fallado", "missed")}
                        className={`h-2 w-2 shrink-0 rounded-full ${r.verdictCorrect ? "bg-ok" : "bg-bad"}`}
                      />
                    )}
                    {!r && i === active && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 rounded-xl border border-desk-line p-3 text-xs leading-relaxed text-fog">
            {t("Atajos", "Shortcuts")}: <kbd>P</kbd> phishing · <kbd>L</kbd> {t("legítimo", "legit")} · <kbd>Enter</kbd> {t("siguiente", "next")}
          </div>
        </div>
      </aside>

      <div className="min-w-0 space-y-5">
        <div className="sticky top-16 z-20 -mx-4 border-b border-desk-line/60 bg-desk/85 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
          <div className="flex items-center gap-4">
            <div className="flex flex-1 gap-1" aria-hidden>
              {scenarios.map((s, i) => {
                const r = results[i];
                const color = r ? (r.verdictCorrect ? "bg-ok" : "bg-bad") : i === active ? "bg-hl" : "bg-desk-line";
                return (
                  <span
                    key={s.id}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${color} ${i === view ? "ring-2 ring-chalk/40 ring-offset-1 ring-offset-desk" : ""}`}
                  />
                );
              })}
            </div>
            {streak >= 2 && (
              <span key={streak} className="pop-in shrink-0 rounded-full bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand">
                <Flame className="mr-1 inline h-3.5 w-3.5 -translate-y-px" strokeWidth={1.75} aria-hidden />
                {streak} {t("seguidas", "in a row")}
              </span>
            )}
            <span className="shrink-0 font-semibold text-lg tabular-nums" aria-live="polite">
              {shownTotal}
              <span className="ml-1 font-sans text-xs font-normal text-fog">pts</span>
            </span>
          </div>
          {seconds && !revealed && view === active && (
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-desk-line">
                <div
                  className={`h-full origin-left rounded-full transition-[background-color] ${timePct < 25 ? "bg-bad" : timePct < 50 ? "bg-hl" : "bg-ok"}`}
                  style={{ transform: `scaleX(${timePct / 100})` }}
                />
              </div>
              <span className={`w-10 text-right font-mono text-sm tabular-nums ${timePct < 25 ? "text-bad" : "text-fog"}`}>
                {Math.ceil(remaining)}s
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] text-fog">
              {t("Mensaje", "Message")} {view + 1} {t("de", "of")} {scenarios.length} · {channelLabels(lang)[scenario.channel]} · {DIFFICULTY[scenario.difficulty]}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-chalk/90">{scenario.context}</p>
          </div>
          {reviewing && (
            <button type="button" onClick={() => setView(Math.min(active, scenarios.length - 1))} className="btn btn-ghost px-4 py-2 text-sm">
              {t("Volver al mensaje actual →", "Back to current message →")}
            </button>
          )}
        </div>

        <MessageView
          key={`${scenario.id}-${revealed}`}
          scenario={scenario}
          segmented={segmented}
          marked={marked}
          revealed={revealed}
          stamped={stamped}
          signalNumbers={signalNumbers}
          onToggle={toggle}
        />

        {revealed ? (
          <ResultPanel
            key={`r-${scenario.id}`}
            scenario={scenario}
            result={result}
            signalNumbers={signalNumbers}
            isLast={view === scenarios.length - 1}
            onNext={reviewing ? null : next}
          />
        ) : (
          <div className="sticky bottom-3 z-10 rounded-3xl border border-desk-line bg-desk-2/95 p-3 shadow-[0_20px_50px_-20px_var(--shadow)] backdrop-blur sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3 px-1 text-sm">
              <span className="text-fog">
                {marked.size === 0 ? (
                  <>{t("Toca lo que te parezca sospechoso para resaltarlo", "Tap anything that looks suspicious to highlight it")}</>
                ) : (
                  <>
                    <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-hl align-middle" />
                    <strong className="text-chalk">{marked.size}</strong> {marked.size === 1 ? t("parte resaltada", "part highlighted") : t("partes resaltadas", "parts highlighted")}
                  </>
                )}
              </span>
              {marked.size > 0 && (
                <button
                  type="button"
                  onClick={() => setMarks((p) => Object.assign([...p], { [view]: new Set() }))}
                  className="text-fog underline-offset-2 hover:text-chalk hover:underline"
                >
                  {t("Borrar", "Clear")}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => decide("phishing")} className="btn btn-danger px-4 py-3.5">
                {t("Es phishing", "It's phishing")} <kbd className="hidden sm:inline">P</kbd>
              </button>
              <button type="button" onClick={() => decide("legit")} className="btn btn-ok px-4 py-3.5">
                {t("Es legítimo", "It's legit")} <kbd className="hidden sm:inline">L</kbd>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
