"use client";

import { Check, Swords, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { submitChallenge, type ChallengeResult } from "@/app/actions/challenge";
import { MessageCard, type MessageChannel } from "@/components/MessageCard";
import { ShareButtons } from "@/components/share/ShareButtons";

export interface PublicChallengeItem {
  id: string;
  channel: MessageChannel;
  from: string;
  text: string;
}

type Done = Extract<ChallengeResult, { ok: true }>;

export function ChallengePlayer({
  code,
  creatorName,
  creatorScore,
  isCreator,
  loggedIn,
  items,
}: {
  code: string;
  creatorName: string;
  creatorScore: number | null;
  isCreator: boolean;
  loggedIn: boolean;
  items: PublicChallengeItem[];
}) {
  const [phase, setPhase] = useState<"intro" | "play" | "sending" | "done">("intro");
  const [name, setName] = useState("");
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [res, setRes] = useState<Done | null>(null);
  const [error, setError] = useState("");
  const total = items.length;

  async function choose(a: "phishing" | "legit") {
    const next = [...answers, a];
    setAnswers(next);
    if (next.length < total) return setI(i + 1);
    setPhase("sending");
    const r = await submitChallenge(code, next, name);
    if (r.ok) {
      setRes(r);
      setPhase("done");
    } else {
      setError(r.error);
      setPhase("intro");
      setAnswers([]);
      setI(0);
    }
  }

  if (phase === "intro") {
    const replay = isCreator && creatorScore !== null;
    return (
      <div className="rounded-3xl border border-desk-line bg-desk-2 p-7 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-field text-brand">
          <Swords className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-3xl">
          {isCreator ? "Tu reto" : `${creatorName} te reta`}
        </h1>
        <p className="mt-2 text-fog">
          {isCreator
            ? creatorScore === null
              ? `Juégalo primero: tu puntaje será la marca a vencer. Son ${total} mensajes.`
              : `Tu marca: ${creatorScore}/${total}. Compártelo y mira quién te gana.`
            : creatorScore === null
              ? `${total} mensajes: ¿trampa o real? ${creatorName} aún no lo juega.`
              : `Sacó ${creatorScore}/${total}. ¿Puedes ganarle? Son ${total} mensajes: ¿trampa o real?`}
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm text-bad-text">
            {error}
          </p>
        )}
        {!isCreator && !loggedIn && (
          <label className="mx-auto mt-6 block max-w-xs text-left">
            <span className="mb-1.5 block text-sm font-medium">Tu nombre para la tabla (opcional)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Ej.: Ana"
              className="field"
            />
            <span className="mt-1 block text-xs text-fog">Lo verá cualquiera con el enlace. Usa un apodo si prefieres.</span>
          </label>
        )}
        {replay ? (
          <div className="mt-6 flex justify-center">
            <ShareButtons path={`/reto/${code}`} text={`Te reto: saqué ${creatorScore}/${total} detectando estafas en Ciberlearn. ¿Me ganas?`} />
          </div>
        ) : (
          <button type="button" onClick={() => setPhase("play")} className="btn btn-primary mt-6 h-12 px-8">
            Empezar
          </button>
        )}
      </div>
    );
  }

  if (phase === "play" || phase === "sending") {
    const it = items[Math.min(i, total - 1)];
    return (
      <div>
        <div className="flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-desk-3">
            <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${(answers.length / total) * 100}%` }} />
          </div>
          <span className="text-sm tabular-nums text-fog">
            {Math.min(answers.length + 1, total)}/{total}
          </span>
        </div>
        <div key={it.id} className="reveal-item mt-8">
          <p className="eyebrow">¿Trampa o real?</p>
          <div className="mt-4">
            <MessageCard channel={it.channel} from={it.from} text={it.text} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {(["phishing", "legit"] as const).map((c) => (
              <button
                key={c}
                type="button"
                disabled={phase === "sending"}
                onClick={() => choose(c)}
                className="min-h-14 rounded-2xl border-2 border-desk-line bg-desk-2 px-4 py-3 font-semibold transition-[border-color,background-color,transform] duration-150 hover:border-brand hover:bg-field active:scale-[0.98] disabled:opacity-60"
              >
                {c === "phishing" ? "Es trampa" : "Es real"}
              </button>
            ))}
          </div>
          {phase === "sending" && <p className="mt-4 text-center text-sm text-fog">Calificando…</p>}
        </div>
      </div>
    );
  }

  // Resultado
  const r = res!;
  const headline = r.isCreator
    ? "Tu marca quedó guardada"
    : r.outcome === "ganaste"
      ? `¡Le ganaste a ${r.creatorName}!`
      : r.outcome === "empate"
        ? `Empate con ${r.creatorName}`
        : r.outcome === "perdiste"
          ? `${r.creatorName} te ganó`
          : "¡Listo!";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-desk-line bg-desk-2 p-7 text-center">
        <Trophy className="mx-auto h-10 w-10 text-[#f59e0b]" strokeWidth={1.75} aria-hidden />
        <p className="mt-3 font-display text-6xl tabular-nums">
          {r.score}/{r.total}
        </p>
        <h1 className="mt-2 font-display text-2xl">{headline}</h1>
        {!r.isCreator && r.creatorScore !== null && (
          <p className="mt-1 text-fog">
            {r.creatorName}: {r.creatorScore}/{r.total} · tú: {r.score}/{r.total}
          </p>
        )}
        <div className="mt-6 flex flex-col items-center gap-3">
          {r.isCreator ? (
            <>
              <p className="text-sm text-fog">Ahora mándalo a quien quieras:</p>
              <ShareButtons path={`/reto/${code}`} text={`Te reto: saqué ${r.score}/${r.total} detectando estafas en Ciberlearn. ¿Me ganas?`} />
            </>
          ) : loggedIn ? (
            <Link href="/reto" className="btn btn-primary h-12 px-6">
              Crear mi propio reto
            </Link>
          ) : (
            <Link href="/registro?next=/reto" className="btn btn-primary h-12 px-6">
              Crea tu cuenta y reta a tus amigos
            </Link>
          )}
        </div>
      </div>

      <section>
        <h2 className="font-display text-xl">Las respuestas</h2>
        <ul className="mt-3 space-y-2">
          {r.results.map((x, n) => (
            <li key={x.id} className="flex gap-3 rounded-2xl border border-desk-line bg-desk-2 p-4 text-sm">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-white ${x.correct ? "bg-ok" : "bg-bad"}`}>
                {x.correct ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : <X className="h-4 w-4" strokeWidth={3} aria-hidden />}
              </span>
              <span>
                <span className="font-semibold">
                  {n + 1}. Era {x.answer === "phishing" ? "trampa" : "real"}.
                </span>{" "}
                <span className="text-graphite">{x.explain}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {r.top.length > 0 && (
        <section>
          <h2 className="font-display text-xl">Tabla del reto</h2>
          <ol className="mt-3 divide-y divide-desk-line rounded-2xl border border-desk-line bg-desk-2">
            {r.top.map((p, n) => (
              <li key={n} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span>
                  <span className="mr-2 tabular-nums text-fog">{n + 1}.</span>
                  {p.name}
                </span>
                <span className="font-semibold tabular-nums">
                  {p.score}/{r.total}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
