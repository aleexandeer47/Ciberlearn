"use client";

import { Check, Swords, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { submitChallenge, type ChallengeResult } from "@/app/actions/challenge";
import { useT } from "@/components/i18n/LangProvider";
import { MessageCard, type MessageChannel } from "@/components/MessageCard";
import { ShareButtons } from "@/components/share/ShareButtons";
import { sfx } from "@/lib/sfx";
import { SITE } from "@/lib/site";

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
  const t = useT();
  const dare = (score: number | null) =>
    t(
      `Te reto: saqué ${score}/${total} detectando estafas en ${SITE.name}. ¿Me ganas?`,
      `I dare you: I scored ${score}/${total} spotting scams on ${SITE.name}. Can you beat me?`,
    );

  async function choose(a: "phishing" | "legit") {
    const next = [...answers, a];
    setAnswers(next);
    // Las respuestas se califican al final (en el servidor): mientras tanto, solo el ping de "anotado".
    if (next.length < total) {
      sfx.mark();
      return setI(i + 1);
    }
    setPhase("sending");
    const r = await submitChallenge(code, next, name);
    if (r.ok) {
      if (r.outcome === "perdiste" || r.score < total / 2) sfx.wrong();
      else sfx.complete();
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
          {isCreator ? t("Tu reto", "Your challenge") : t(`${creatorName} te reta`, `${creatorName} challenges you`)}
        </h1>
        <p className="mt-2 text-fog">
          {isCreator
            ? creatorScore === null
              ? t(`Juégalo primero: tu puntaje será la marca a vencer. Son ${total} mensajes.`, `Play it first: your score will be the one to beat. It's ${total} messages.`)
              : t(`Tu marca: ${creatorScore}/${total}. Compártelo y mira quién te gana.`, `Your score: ${creatorScore}/${total}. Share it and see who beats you.`)
            : creatorScore === null
              ? t(`${total} mensajes: ¿trampa o real? ${creatorName} aún no lo juega.`, `${total} messages: scam or real? ${creatorName} hasn't played yet.`)
              : t(`Sacó ${creatorScore}/${total}. ¿Puedes ganarle? Son ${total} mensajes: ¿trampa o real?`, `They scored ${creatorScore}/${total}. Can you beat them? ${total} messages: scam or real?`)}
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm text-bad-text">
            {error}
          </p>
        )}
        {!isCreator && !loggedIn && (
          <label className="mx-auto mt-6 block max-w-xs text-left">
            <span className="mb-1.5 block text-sm font-medium">{t("Tu nombre para la tabla (opcional)", "Your name for the leaderboard (optional)")}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder={t("Ej.: Ana", "E.g. Ana")}
              className="field"
            />
            <span className="mt-1 block text-xs text-fog">
              {t("Lo verá cualquiera con el enlace. Usa un apodo si prefieres.", "Anyone with the link will see it. Use a nickname if you prefer.")}
            </span>
          </label>
        )}
        {replay ? (
          <div className="mt-6 flex justify-center">
            <ShareButtons path={`/reto/${code}`} text={dare(creatorScore)} />
          </div>
        ) : (
          <button type="button" onClick={() => setPhase("play")} className="btn btn-primary mt-6 h-12 px-8">
            {t("Empezar", "Start")}
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
          <p className="eyebrow">{t("¿Trampa o real?", "Scam or real?")}</p>
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
                {c === "phishing" ? t("Es trampa", "It's a scam") : t("Es real", "It's real")}
              </button>
            ))}
          </div>
          {phase === "sending" && <p className="mt-4 text-center text-sm text-fog">{t("Calificando…", "Scoring…")}</p>}
        </div>
      </div>
    );
  }

  // Resultado
  const r = res!;
  const headline = r.isCreator
    ? t("Tu marca quedó guardada", "Your score is saved")
    : r.outcome === "ganaste"
      ? t(`¡Le ganaste a ${r.creatorName}!`, `You beat ${r.creatorName}!`)
      : r.outcome === "empate"
        ? t(`Empate con ${r.creatorName}`, `Tied with ${r.creatorName}`)
        : r.outcome === "perdiste"
          ? t(`${r.creatorName} te ganó`, `${r.creatorName} beat you`)
          : t("¡Listo!", "Done!");

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
            {r.creatorName}: {r.creatorScore}/{r.total} · {t("tú", "you")}: {r.score}/{r.total}
          </p>
        )}
        <div className="mt-6 flex flex-col items-center gap-3">
          {r.isCreator ? (
            <>
              <p className="text-sm text-fog">{t("Ahora mándalo a quien quieras:", "Now send it to whoever you want:")}</p>
              <ShareButtons path={`/reto/${code}`} text={dare(r.score)} />
            </>
          ) : loggedIn ? (
            <Link href="/reto" className="btn btn-primary h-12 px-6">
              {t("Crear mi propio reto", "Create my own challenge")}
            </Link>
          ) : (
            <Link href="/registro?next=/reto" className="btn btn-primary h-12 px-6">
              {t("Crea tu cuenta y reta a tus amigos", "Sign up and challenge your friends")}
            </Link>
          )}
        </div>
      </div>

      <section>
        <h2 className="font-display text-xl">{t("Las respuestas", "The answers")}</h2>
        <ul className="mt-3 space-y-2">
          {r.results.map((x, n) => (
            <li key={x.id} className="flex gap-3 rounded-2xl border border-desk-line bg-desk-2 p-4 text-sm">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-white ${x.correct ? "bg-ok" : "bg-bad"}`}>
                {x.correct ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : <X className="h-4 w-4" strokeWidth={3} aria-hidden />}
              </span>
              <span>
                <span className="font-semibold">
                  {n + 1}. {x.answer === "phishing" ? t("Era trampa", "It was a scam") : t("Era real", "It was real")}.
                </span>{" "}
                <span className="text-graphite">{x.explain}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {r.top.length > 0 && (
        <section>
          <h2 className="font-display text-xl">{t("Tabla del reto", "Challenge leaderboard")}</h2>
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
