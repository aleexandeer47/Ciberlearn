"use client";

import { Check, Flame, Lightbulb, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { answerDaily, type DailyResult } from "@/app/actions/daily";
import { MessageCard } from "@/components/MessageCard";
import { ShareButtons } from "@/components/share/ShareButtons";
import type { PublicDailyCase } from "@/lib/daily";

type Done = Extract<DailyResult, { ok: true }> & { choice?: string };

/** Tiempo hasta la medianoche de El Salvador (UTC-6), cuando cambia el caso. */
function untilNext(now = Date.now()) {
  const sv = now - 6 * 3600_000;
  const next = Math.floor(sv / 864e5 + 1) * 864e5 + 6 * 3600_000;
  const m = Math.max(0, Math.ceil((next - now) / 60_000));
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

export function DailyCard({
  kase,
  loggedIn,
  initial,
  streak,
}: {
  kase: PublicDailyCase;
  loggedIn: boolean;
  /** Si ya respondió hoy */
  initial: Done | null;
  streak: number;
}) {
  const [done, setDone] = useState<Done | null>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [left, setLeft] = useState("");

  useEffect(() => {
    const tick = () => setLeft(untilNext());
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);

  async function pick(choice: "phishing" | "legit") {
    if (busy || done) return;
    setBusy(true);
    const r = await answerDaily(choice);
    setBusy(false);
    if (r.ok) setDone({ ...r, choice });
    else setError(r.error);
  }

  const shownStreak = done?.streak ?? streak;

  return (
    <div className="space-y-6">
      <MessageCard channel={kase.channel} from={kase.from} text={kase.text} />

      {!done ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {(["phishing", "legit"] as const).map((c) => (
              <button
                key={c}
                type="button"
                disabled={busy}
                onClick={() => pick(c)}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-desk-line bg-desk-2 px-4 py-3 font-semibold transition-[border-color,background-color,transform] duration-150 hover:border-brand hover:bg-field active:scale-[0.98] disabled:opacity-60"
              >
                {c === "phishing" ? "Es trampa" : "Es real"}
              </button>
            ))}
          </div>
          {error && (
            <p role="alert" className="text-sm text-bad-text">
              {error}
            </p>
          )}
        </>
      ) : (
        <div className={`reveal-item rounded-3xl p-6 text-ink ${done.correct ? "bg-ok-soft" : "bg-bad-soft"}`}>
          <p className={`flex items-center gap-2 text-lg font-semibold ${done.correct ? "text-ok" : "text-[#b91c1c]"}`}>
            {done.correct ? <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden /> : <X className="h-5 w-5" strokeWidth={2.5} aria-hidden />}
            {done.correct ? "¡Bien visto!" : "Esta vez no"} · era {done.answer === "phishing" ? "una trampa" : "un mensaje real"}
          </p>
          <p className="mt-2 leading-relaxed">{done.explain}</p>
          <p className="mt-4 flex gap-2 rounded-2xl bg-white/60 p-3 text-sm">
            <Lightbulb className="h-4 w-4 shrink-0 text-[#b45309]" strokeWidth={2} aria-hidden />
            {done.tip}
          </p>
          {done.already && <p className="mt-3 text-sm text-ink-2">Ya habías respondido hoy: cuenta tu primera respuesta.</p>}
        </div>
      )}

      {done && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-desk-line bg-desk-2 p-5">
            {loggedIn ? (
              <>
                <p className="flex items-center gap-2 font-display text-3xl tabular-nums">
                  <Flame className="h-7 w-7 text-[#f97316]" strokeWidth={2} aria-hidden />
                  {shownStreak} {shownStreak === 1 ? "día" : "días"}
                </p>
                <p className="mt-1 text-sm text-fog">
                  Racha seguida{done.best ? ` · tu mejor: ${done.best}` : ""}
                  {done.xp > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 text-brand">
                      <Zap className="h-3.5 w-3.5" aria-hidden />+{done.xp} XP
                    </span>
                  )}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">Guarda tu racha</p>
                <p className="mt-1 text-sm text-fog">Con una cuenta gratis sumas XP y llevas la cuenta de tus días seguidos.</p>
                <Link href="/registro?next=/diaria" className="btn btn-primary mt-3 h-10 px-4 text-sm">
                  Crear cuenta gratis
                </Link>
              </>
            )}
          </div>
          <div className="rounded-3xl border border-desk-line bg-desk-2 p-5">
            <p className="font-semibold">Nuevo caso en {left || "…"}</p>
            <p className="mb-3 mt-1 text-sm text-fog">Reta a alguien con el caso de hoy:</p>
            <ShareButtons compact path="/diaria" text={`¿Es trampa o es real? Hoy ${done.correct ? "acerté" : "fallé"} la estafa del día de Ciberlearn. ¿Y tú?`} />
          </div>
        </div>
      )}
    </div>
  );
}
