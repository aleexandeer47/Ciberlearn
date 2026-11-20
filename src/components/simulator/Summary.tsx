"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { saveRun, type RunInput } from "@/app/actions/runs";
import { CATEGORY_LABELS } from "@/lib/scenarios/categories";
import type { Scenario } from "@/lib/scenarios/types";
import { summarize, type ScenarioResult } from "@/lib/scoring";
import { SITE } from "@/lib/site";
import { useCountUp } from "@/lib/useCountUp";

function rating(score: number) {
  if (score >= 85) return { title: "Ojo de halcón", text: "Detectas casi todas las trampas. Comparte la prueba con quien más lo necesite." };
  if (score >= 65) return { title: "Buen instinto", text: "Reconoces lo principal, pero algunas señales se te escapan. Repasa las categorías de abajo." };
  if (score >= 40) return { title: "Vas aprendiendo", text: "Varias estafas habrían funcionado contigo. Vuelve a intentarlo fijándote en los dominios y enlaces." };
  return { title: "Presa fácil (por ahora)", text: "No pasa nada: para eso es el simulador. Repite la prueba leyendo las explicaciones con calma." };
}

const R = 70;
const C = 2 * Math.PI * R;

export const PENDING_RUN_KEY = "ciberlearn:pendingRun";

type SaveState = "saving" | "saved" | "guest" | "error";

export function Summary({
  scenarios,
  results,
  run,
  onRestart,
}: {
  scenarios: Scenario[];
  results: ScenarioResult[];
  run: RunInput;
  onRestart: () => void;
}) {
  const { score, correctVerdicts, categories } = summarize(scenarios, results);
  const shown = useCountUp(score, 1200, 0);
  const r = rating(score);
  const [copied, setCopied] = useState(false);
  const [save, setSave] = useState<{ state: SaveState; msg?: string }>({ state: "saving" });
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    saveRun(run)
      .then((res) => {
        if (res.ok) setSave({ state: "saved" });
        else if (res.error.startsWith("Inicia sesión")) {
          // Sin cuenta: la guardamos aquí y se sube al registrarse.
          try {
            sessionStorage.setItem(PENDING_RUN_KEY, JSON.stringify(run));
          } catch {}
          setSave({ state: "guest" });
        } else setSave({ state: "error", msg: res.error });
      })
      .catch(() => setSave({ state: "error", msg: "No pudimos guardar la ronda." }));
  }, [run]);

  const share = async () => {
    const url = `${window.location.origin}/simulador`;
    const msg = `Saqué ${score}/100 en el simulador de phishing de ${SITE.name}. ¿Tú picarías el anzuelo?`;
    try {
      if (navigator.share) await navigator.share({ title: SITE.name, text: msg, url });
      else {
        await navigator.clipboard.writeText(`${msg} ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* el usuario canceló */
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div aria-live="polite">
        {save.state === "saved" && (
          <div className="pop-in flex flex-col items-start justify-between gap-3 rounded-2xl border border-ok/40 bg-ok/10 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-sm">
              <strong className="text-ok">Guardado en tu expediente.</strong> Tus skills y tu nivel ya están actualizados.
            </p>
            <Link href="/progreso" className="btn btn-ok shrink-0 px-5 py-2.5 text-sm">
              Ver mi progreso →
            </Link>
          </div>
        )}
        {save.state === "guest" && (
          <div className="pop-in flex flex-col items-start justify-between gap-3 rounded-2xl border border-accent/40 bg-hl/10 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-sm">
              <strong className="text-accent">No pierdas este resultado.</strong> Crea tu cuenta gratis y lo guardamos con tu nivel y tus skills.
            </p>
            <Link href="/registro?next=/progreso" className="btn btn-primary shrink-0 px-5 py-2.5 text-sm">
              Guardar mi resultado
            </Link>
          </div>
        )}
        {save.state === "error" && <p className="rounded-2xl bg-bad/15 px-5 py-3 text-sm text-bad-text">{save.msg}</p>}
      </div>
      <section className="grid items-center gap-8 rounded-3xl border border-desk-line bg-desk-2 p-6 sm:p-10 md:grid-cols-[auto_1fr]">
        <div className="relative mx-auto h-44 w-44">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="80" cy="80" r={R} fill="none" stroke="var(--desk-line)" strokeWidth="12" />
            <circle
              cx="80"
              cy="80"
              r={R}
              fill="none"
              stroke={score >= 65 ? "var(--ok)" : score >= 40 ? "var(--accent)" : "var(--bad)"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - shown / 100)}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <span className="font-display text-5xl font-semibold tabular-nums">{shown}</span>
              <span className="block text-xs text-fog">de 100</span>
            </div>
          </div>
        </div>
        <div className="text-center md:text-left">
          <p className="eyebrow">Tu resultado</p>
          <h1 className="pop-in mt-2 font-display text-3xl font-semibold sm:text-4xl">{r.title}</h1>
          <p className="mt-3 max-w-lg leading-relaxed text-fog">{r.text}</p>
          <p className="mt-4 text-sm text-chalk/80">
            Acertaste el veredicto en <strong>{correctVerdicts}</strong> de {results.length} mensajes.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={onRestart} className="btn btn-primary px-6 py-3">
              Repetir la prueba
            </button>
            <button type="button" onClick={share} className="btn btn-ghost px-6 py-3">
              {copied ? "Enlace copiado" : "Compartir resultado"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-desk-line bg-desk-2 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Mensaje por mensaje</h2>
        <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {scenarios.map((s, n) => {
            const res = results[n];
            const ok = res?.verdictCorrect;
            return (
              <li
                key={s.id}
                className="reveal-item relative overflow-hidden rounded-xl bg-paper p-3 text-ink ring-1 ring-line"
                style={{ "--i": n } as CSSProperties}
              >
                <p className="font-mono text-[10px] text-ink-3">#{n + 1}</p>
                <p className="mt-1 truncate text-sm font-semibold">{typeof s.from.name === "string" ? s.from.name : s.from.name.t}</p>
                <p className="mt-2 font-semibold text-lg tabular-nums">{res?.points ?? 0}</p>
                <span
                  className={`absolute right-2 top-2 -rotate-12 rounded border-2 border-double px-1 font-display text-[9px] font-bold uppercase ${
                    ok ? "border-ok text-ok" : "border-bad text-bad"
                  }`}
                >
                  {ok ? "Bien" : "Falló"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-3xl border border-desk-line bg-desk-2 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Señales que detectaste</h2>
        <p className="mb-6 mt-1 text-sm text-fog">De la que más se te escapó a la que mejor dominas.</p>
        <ul className="space-y-5">
          {categories.map((c, n) => {
            const pct = Math.round((c.found / c.total) * 100);
            return (
              <li key={c.category}>
                <div className="mb-1.5 flex justify-between gap-3 text-sm">
                  <span className="font-semibold">{CATEGORY_LABELS[c.category].label}</span>
                  <span className="tabular-nums text-fog">
                    {c.found}/{c.total}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-desk">
                  <div
                    className={`bar-fill h-full rounded-full ${pct >= 70 ? "bg-ok" : pct >= 40 ? "bg-accent" : "bg-bad"}`}
                    style={{ width: `${Math.max(pct, 3)}%`, "--i": n } as CSSProperties}
                  />
                </div>
                <p className="mt-1.5 text-xs text-fog">{CATEGORY_LABELS[c.category].hint}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-paper p-6 text-ink ring-1 ring-line sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 className="font-display text-xl font-semibold">¿Quieres mensajes más difíciles?</h2>
          <p className="mt-1 text-ink-2">Pro suma un pack avanzado, contrarreloj y entrenamiento de tu punto débil.</p>
        </div>
        <Link href="/planes" className="btn btn-ink shrink-0 px-6 py-3">
          Ver planes
        </Link>
      </section>
    </div>
  );
}
