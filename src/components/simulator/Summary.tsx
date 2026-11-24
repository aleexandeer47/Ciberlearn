"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { saveRun, type RunInput } from "@/app/actions/runs";
import { useLang, useT } from "@/components/i18n/LangProvider";
import type { T } from "@/lib/i18n";
import { categoryLabels } from "@/lib/scenarios/categories";
import type { Scenario } from "@/lib/scenarios/types";
import { summarize, type ScenarioResult } from "@/lib/scoring";
import { SITE } from "@/lib/site";
import { useCountUp } from "@/lib/useCountUp";

function rating(score: number, t: T) {
  if (score >= 85)
    return {
      title: t("Ojo de halcón", "Hawk eye"),
      text: t(
        "Detectas casi todas las trampas. Comparte la prueba con quien más lo necesite.",
        "You spot almost every trap. Share the test with whoever needs it most.",
      ),
    };
  if (score >= 65)
    return {
      title: t("Buen instinto", "Good instincts"),
      text: t(
        "Reconoces lo principal, pero algunas señales se te escapan. Repasa las categorías de abajo.",
        "You catch the main things, but some signs slip past you. Review the categories below.",
      ),
    };
  if (score >= 40)
    return {
      title: t("Vas aprendiendo", "Getting there"),
      text: t(
        "Varias estafas habrían funcionado contigo. Vuelve a intentarlo fijándote en los dominios y enlaces.",
        "Several scams would have worked on you. Try again, paying attention to domains and links.",
      ),
    };
  return {
    title: t("Presa fácil (por ahora)", "Easy catch (for now)"),
    text: t(
      "No pasa nada: para eso es el simulador. Repite la prueba leyendo las explicaciones con calma.",
      "That's fine: that's what the simulator is for. Retake the test and read the explanations calmly.",
    ),
  };
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
  const lang = useLang();
  const t = useT();
  const L = categoryLabels(lang);
  const r = rating(score, t);
  const [copied, setCopied] = useState(false);
  const [save, setSave] = useState<{ state: SaveState; msg?: string }>({ state: "saving" });
  const sent = useRef(false);
  // null mientras se guarda la ronda (el servidor responde si la cuenta es Pro)
  const [pro, setPro] = useState<boolean | null>(null);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    saveRun(run)
      .then((res) => {
        if (res.ok) {
          setSave({ state: "saved" });
          setPro(res.isPro);
        } else if (res.error.startsWith("Inicia sesión") || res.error.startsWith("Log in")) {
          // Sin cuenta: la guardamos aquí y se sube al registrarse.
          try {
            sessionStorage.setItem(PENDING_RUN_KEY, JSON.stringify(run));
          } catch {}
          setSave({ state: "guest" });
        } else setSave({ state: "error", msg: res.error });
      })
      .catch(() => setSave({ state: "error", msg: t("No pudimos guardar la ronda.", "We couldn't save the round.") }));
  }, [run, t]);

  const share = async () => {
    const url = `${window.location.origin}/simulador`;
    const msg = t(
      `Saqué ${score}/100 en el simulador de phishing de ${SITE.name}. ¿Tú picarías el anzuelo?`,
      `I scored ${score}/100 on the ${SITE.name} phishing simulator. Would you take the bait?`,
    );
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
              <strong className="text-ok">{t("Guardado en tu expediente.", "Saved to your record.")}</strong>{" "}
              {t("Tus skills y tu nivel ya están actualizados.", "Your skills and level are updated.")}
            </p>
            <Link href="/progreso" className="btn btn-ok shrink-0 px-5 py-2.5 text-sm">
              {t("Ver mi progreso →", "See my progress →")}
            </Link>
          </div>
        )}
        {save.state === "guest" && (
          <div className="pop-in flex flex-col items-start justify-between gap-3 rounded-2xl border border-accent/40 bg-hl/10 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-sm">
              <strong className="text-accent">{t("No pierdas este resultado.", "Don't lose this result.")}</strong>{" "}
              {t("Crea tu cuenta gratis y lo guardamos con tu nivel y tus skills.", "Create your free account and we'll save it with your level and skills.")}
            </p>
            <Link href="/registro?next=/progreso" className="btn btn-primary shrink-0 px-5 py-2.5 text-sm">
              {t("Guardar mi resultado", "Save my result")}
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
              <span className="block text-xs text-fog">{t("de 100", "out of 100")}</span>
            </div>
          </div>
        </div>
        <div className="text-center md:text-left">
          <p className="eyebrow">{t("Tu resultado", "Your result")}</p>
          <h1 className="pop-in mt-2 font-display text-3xl font-semibold sm:text-4xl">{r.title}</h1>
          <p className="mt-3 max-w-lg leading-relaxed text-fog">{r.text}</p>
          <p className="mt-4 text-sm text-chalk/80">
            {t("Acertaste el veredicto en", "You got the verdict right on")} <strong>{correctVerdicts}</strong> {t("de", "of")}{" "}
            {results.length} {t("mensajes", "messages")}.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={onRestart} className="btn btn-primary px-6 py-3">
              {t("Repetir la prueba", "Retake the test")}
            </button>
            <button type="button" onClick={share} className="btn btn-ghost px-6 py-3">
              {copied ? t("Enlace copiado", "Link copied") : t("Compartir resultado", "Share result")}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-desk-line bg-desk-2 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">{t("Mensaje por mensaje", "Message by message")}</h2>
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
                  {ok ? t("Bien", "Right") : t("Falló", "Missed")}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-3xl border border-desk-line bg-desk-2 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">{t("Señales que detectaste", "Signs you spotted")}</h2>
        <p className="mb-6 mt-1 text-sm text-fog">{t("De la que más se te escapó a la que mejor dominas.", "From the one you missed most to the one you've mastered.")}</p>
        <ul className="space-y-5">
          {categories.map((c, n) => {
            const pct = Math.round((c.found / c.total) * 100);
            return (
              <li key={c.category}>
                <div className="mb-1.5 flex justify-between gap-3 text-sm">
                  <span className="font-semibold">{L[c.category].label}</span>
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
                <p className="mt-1.5 text-xs text-fog">{L[c.category].hint}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {pro ? (
        // Con Pro: acceso directo a los modos difíciles
        <section className="rounded-3xl bg-paper p-6 text-ink ring-1 ring-line sm:p-8">
          <h2 className="font-display text-xl font-semibold">{t("Sube la dificultad", "Turn up the difficulty")}</h2>
          <p className="mt-1 text-ink-2">{t("Tienes Pro: elige tu siguiente reto.", "You have Pro: pick your next challenge.")}</p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { href: "/simulador/pro", title: t("Pack avanzado", "Advanced pack"), desc: t("6 mensajes más difíciles", "6 harder messages") },
              { href: "/simulador/contrarreloj", title: t("Contrarreloj", "Time trial"), desc: t("40 segundos por mensaje", "40 seconds per message") },
              { href: "/simulador/entrenamiento", title: t("Entrenamiento", "Training"), desc: t("Tu punto débil", "Your weak spot") },
            ].map((m) => (
              <Link key={m.href} href={m.href} className="group rounded-2xl border border-line px-4 py-3 transition-colors hover:border-ink">
                <p className="font-semibold">
                  {m.title} <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </p>
                <p className="text-sm text-ink-2">{m.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : pro === false || save.state === "guest" ? (
        <section className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-paper p-6 text-ink ring-1 ring-line sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="font-display text-xl font-semibold">{t("¿Quieres mensajes más difíciles?", "Want harder messages?")}</h2>
            <p className="mt-1 text-ink-2">
              {t(
                "Pro suma un pack avanzado, contrarreloj y entrenamiento de tu punto débil.",
                "Pro adds an advanced pack, a time trial and training for your weak spot.",
              )}
            </p>
          </div>
          <Link href="/planes" className="btn btn-ink shrink-0 px-6 py-3">
            {t("Ver planes", "See plans")}
          </Link>
        </section>
      ) : null}
    </div>
  );
}
