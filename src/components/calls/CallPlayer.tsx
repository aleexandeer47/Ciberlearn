"use client";

import { HelpCircle, Phone, PhoneIncoming, PhoneOff, ShieldAlert, ShieldCheck, ShieldQuestion, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { finishCall } from "@/app/actions/calls";
import { useLang, useT } from "@/components/i18n/LangProvider";
import { CALL_BY_ID, callXp, randomCall, type CallEnd, type CallScenario, type CallVerdict } from "@/lib/calls";
import { sfx } from "@/lib/sfx";
import { speak as speakText, stopSpeaking } from "@/lib/voice";

type Phase = "pick" | "ringing" | "talking" | "verdict" | "end";
interface End {
  outcome: CallEnd;
  verdict: CallVerdict | null;
  note: string;
  /** null mientras el servidor calcula el XP */
  xp: number | null;
}

const isEnd = (n: string): n is CallEnd => n === "fell" || n === "safe" || n === "ok" || n === "declined";

/**
 * Llamada simulada: puede ser una estafa o una llamada real, y no se sabe cuál hasta el final.
 * La voz la genera el navegador (nada se envía a ningún servidor).
 */
export function CallPlayer({ unlocked, loggedIn, isPro }: { unlocked: string[]; loggedIn: boolean; isPro: boolean }) {
  const lang = useLang();
  const t = useT();
  const [call, setCall] = useState<CallScenario | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [step, setStep] = useState("start");
  const [lines, setLines] = useState<{ who: "them" | "me"; text: string }[]>([]);
  const [pending, setPending] = useState<{ outcome: CallEnd; note: string } | null>(null);
  const [end, setEnd] = useState<End | null>(null);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  const [played, setPlayed] = useState(0);
  const bottom = useRef<HTMLDivElement>(null);

  const speak = useCallback(
    (text: string) => {
      if (muted) return;
      // Voz del idioma de la página, la más natural del dispositivo (src/lib/voice.ts)
      void speakText(text, lang, { pitch: 0.95, onStart: () => setSpeaking(true), onEnd: () => setSpeaking(false) }).then((ok) =>
        setNoVoice(!ok),
      );
    },
    [lang, muted],
  );

  useEffect(() => {
    return () => {
      stopSpeaking();
      sfx.stopRing();
    };
  }, []);
  // Con llaves: en Chrome reciente scrollIntoView devuelve una promesa, y un efecto no puede devolver eso
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines, end, phase]);

  /** Suena el teléfono: Pro recibe una llamada al azar; gratis, la del día. */
  const ring = () => {
    const next = isPro ? randomCall(unlocked, call?.id) : CALL_BY_ID.get(unlocked[0])!;
    setCall(next);
    setStep("start");
    setLines([]);
    setEnd(null);
    setPending(null);
    setPhase("ringing");
    sfx.ring();
    if ("vibrate" in navigator) navigator.vibrate?.([300, 200, 300]);
  };

  const answer = () => {
    if (!call) return;
    sfx.stopRing();
    const say = call.steps.start.say[lang];
    setLines([{ who: "them", text: say }]);
    setPhase("talking");
    speak(say);
  };

  /** Guarda el resultado (XP en el servidor) y muestra qué era la llamada. */
  const submit = async (outcome: CallEnd, note: string, verdict: CallVerdict | null) => {
    if (!call) return;
    const preview = callXp(call, outcome, verdict);
    const good = outcome !== "fell" && outcome !== "declined" && preview === 20;
    if (good) sfx.correct();
    else if (outcome !== "declined") sfx.wrong();
    setEnd({ outcome, verdict, note, xp: loggedIn ? null : 0 });
    setPhase("end");
    setPlayed((n) => n + 1);
    if (loggedIn) {
      const r = await finishCall(call.id, outcome, verdict);
      setEnd({ outcome, verdict, note, xp: r.xp });
    }
  };

  /** Termina la llamada. Si no cayó ni rechazó, tiene que decidir qué era. */
  const hangUp = (outcome: CallEnd, note: string) => {
    stopSpeaking();
    setSpeaking(false);
    sfx.hangup();
    if (outcome === "fell" || outcome === "declined") return void submit(outcome, note, null);
    setPending({ outcome, note });
    setPhase("verdict");
  };

  const choose = (i: number) => {
    if (!call) return;
    const ch = call.steps[step].choices[i];
    setLines((l) => [...l, { who: "me", text: ch.label[lang] }]);
    if (isEnd(ch.next)) return void hangUp(ch.next, ch.note?.[lang] ?? "");
    const say = call.steps[ch.next].say[lang];
    setStep(ch.next);
    setTimeout(() => {
      setLines((l) => [...l, { who: "them", text: say }]);
      speak(say);
    }, 500);
  };

  if (phase === "pick" || !call) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-desk-line bg-desk-2 p-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ok/15 text-ok">
          <PhoneIncoming className="h-7 w-7" aria-hidden />
        </span>
        <p className="mt-5 font-display text-2xl">{t("¿Contestas?", "Will you answer?")}</p>
        <p className="mx-auto mt-2 max-w-sm text-fog">
          {t(
            "Te va a llamar alguien. Puede ser una estafa… o una llamada real. Escucha, responde y al final decide qué era.",
            "Someone is going to call you. It could be a scam… or a real call. Listen, reply and decide at the end what it was.",
          )}
        </p>
        <button type="button" onClick={ring} className="btn btn-primary mt-6 h-12 px-7">
          <Phone className="h-4 w-4" aria-hidden /> {t("Recibir una llamada", "Get a call")}
        </button>
        <p className="mt-4 text-xs text-fog">
          {isPro
            ? t("Con Pro las llamadas son aleatorias. Ganas XP en 3 llamadas por día.", "With Pro calls are random. You earn XP on 3 calls per day.")
            : t("Plan gratis: una llamada distinta cada día.", "Free plan: a different call every day.")}
        </p>
      </div>
    );
  }

  const right = end && end.outcome !== "fell" && end.outcome !== "declined" && end.verdict !== null && (end.verdict === "estafa") === call.scam;
  const tone = !end ? "" : end.outcome === "fell" ? "bad" : end.outcome === "declined" ? "neutral" : right ? "ok" : "warn";
  const TONE_CLS = { ok: "bg-ok-soft", bad: "bg-bad-soft", warn: "bg-[#fef3c7]", neutral: "bg-paper ring-1 ring-line" } as const;

  return (
    <div className="mx-auto max-w-md">
      <div className="overflow-hidden rounded-[2.5rem] border-[6px] border-desk-3 bg-[linear-gradient(180deg,#0f172a,#020617)] text-white shadow-2xl">
        <div className="px-6 pb-4 pt-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            {phase === "ringing" ? t("Llamada entrante", "Incoming call") : phase === "talking" ? t("En llamada", "On call") : t("Llamada terminada", "Call ended")}
          </p>
          <p className="mt-3 font-display text-2xl">{call.caller[lang]}</p>
          <p className="font-mono text-sm text-white/60">{call.number}</p>
          {phase === "ringing" && (
            <span className="relative mx-auto mt-6 grid h-20 w-20 place-items-center rounded-full bg-ok/20">
              <span className="absolute inset-0 animate-ping rounded-full bg-ok/30 motion-reduce:animate-none" aria-hidden />
              <Phone className="h-8 w-8 text-ok" aria-hidden />
            </span>
          )}
          {/* Lo que la persona sabe antes de contestar */}
          <p className="mx-auto mt-5 flex max-w-xs items-start gap-2 rounded-2xl bg-white/10 px-3 py-2 text-left text-xs leading-relaxed text-white/80">
            <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              <strong className="text-white">{t("Contexto", "Context")}:</strong> {call.context[lang]}
            </span>
          </p>
        </div>

        {phase !== "ringing" && (
          <div className="max-h-80 space-y-2 overflow-y-auto px-4 pb-4" aria-live="polite">
            {lines.map((x, i) => (
              <p
                key={i}
                className={`reveal-item max-w-[85%] rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed ${
                  x.who === "them" ? "rounded-tl-md bg-white/10" : "ml-auto rounded-br-md bg-brand"
                }`}
              >
                {x.text}
              </p>
            ))}
            {speaking && <p className="px-2 text-xs text-white/50">{t("Hablando…", "Speaking…")}</p>}
            <div ref={bottom} />
          </div>
        )}

        <div className="space-y-2 border-t border-white/10 p-4">
          {phase === "ringing" && (
            <div className="flex justify-center gap-10 py-2">
              <button
                type="button"
                onClick={() =>
                  hangUp(
                    "declined",
                    t("No contestaste, así que no supiste qué era. Rechazar no tiene riesgo, pero así no se aprende a distinguir.", "You didn't answer, so you never found out what it was. Declining is risk-free, but you don't learn to tell them apart."),
                  )
                }
                className="grid h-16 w-16 place-items-center rounded-full bg-bad"
                aria-label={t("Rechazar", "Decline")}
              >
                <PhoneOff className="h-7 w-7" aria-hidden />
              </button>
              <button type="button" onClick={answer} className="grid h-16 w-16 place-items-center rounded-full bg-ok" aria-label={t("Contestar", "Answer")}>
                <Phone className="h-7 w-7" aria-hidden />
              </button>
            </div>
          )}
          {phase === "talking" &&
            call.steps[step].choices.map((ch, i) => (
              <button key={i} type="button" onClick={() => choose(i)} className="w-full rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-white/20">
                {ch.label[lang]}
              </button>
            ))}
          {phase === "talking" && noVoice && !muted && (
            <p role="status" className="text-xs text-white/60">
              {t(
                "Tu dispositivo no tiene una voz en español: lee la conversación en pantalla. Puedes agregar una voz en los ajustes del sistema.",
                "Your device has no English voice: read the conversation on screen. You can add a voice in your system settings.",
              )}
            </p>
          )}
          {phase === "talking" && (
            <div className="flex justify-between pt-1">
              <button type="button" onClick={() => setMuted((m) => !m)} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
                {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
                {muted ? t("Voz apagada", "Voice off") : t("Voz encendida", "Voice on")}
              </button>
              <button type="button" onClick={() => hangUp("safe", "")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#fca5a5]">
                <PhoneOff className="h-4 w-4" aria-hidden /> {t("Colgar", "Hang up")}
              </button>
            </div>
          )}
          {phase === "verdict" && pending && (
            <div className="pop-in text-center">
              <p className="flex items-center justify-center gap-2 font-semibold">
                <ShieldQuestion className="h-5 w-5" aria-hidden /> {t("¿Qué era esta llamada?", "What was this call?")}
              </p>
              <p className="mt-1 text-xs text-white/60">{t("El XP depende de que aciertes.", "Your XP depends on getting it right.")}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => submit(pending.outcome, pending.note, "estafa")} className="rounded-2xl bg-bad/85 px-4 py-3 text-sm font-semibold hover:bg-bad">
                  {t("Una estafa", "A scam")}
                </button>
                <button type="button" onClick={() => submit(pending.outcome, pending.note, "real")} className="rounded-2xl bg-ok/85 px-4 py-3 text-sm font-semibold hover:bg-ok">
                  {t("Una llamada real", "A real call")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {end && (
        <div className={`pop-in mt-6 rounded-3xl p-6 text-ink ${TONE_CLS[tone as keyof typeof TONE_CLS]}`}>
          <p className={`flex items-center gap-2 text-lg font-semibold ${tone === "ok" ? "text-ok" : tone === "bad" ? "text-[#b91c1c]" : "text-ink"}`}>
            {tone === "bad" ? <ShieldAlert className="h-5 w-5" aria-hidden /> : <ShieldCheck className="h-5 w-5" aria-hidden />}
            {end.outcome === "fell"
              ? t("Caíste en la trampa", "You fell for the trap")
              : end.outcome === "declined"
                ? t("No contestaste", "You didn't answer")
                : right
                  ? call.scam
                    ? t("¡Bien! Era una estafa y no caíste", "Nice! It was a scam and you didn't fall for it")
                    : t("¡Bien! Era una llamada real", "Nice! It was a real call")
                  : call.scam
                    ? t("No caíste, pero sí era una estafa", "You didn't fall for it, but it was a scam")
                    : t("Era una llamada real", "It was a real call")}
            {end.xp !== null && end.xp > 0 && <span className="ml-auto text-sm">+{end.xp} XP</span>}
          </p>
          <p className="mt-2 text-sm">
            <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-bold ${call.scam ? "bg-bad text-white" : "bg-ok text-white"}`}>
              {call.scam ? t("Estafa", "Scam") : t("Real", "Real")}
            </span>
            <strong>{call.title[lang]}</strong>
          </p>
          {end.note && <p className="mt-2">{end.note}</p>}
          {!right && end.outcome !== "fell" && end.outcome !== "declined" && !call.scam && (
            <p className="mt-2 text-sm">
              {t(
                "Desconfiar está bien, pero no toda llamada es estafa: fíjate en si te piden códigos, claves, dinero o secreto.",
                "Being suspicious is fine, but not every call is a scam: check whether they ask for codes, passwords, money or secrecy.",
              )}
            </p>
          )}
          <p className="mt-3 rounded-2xl bg-white/60 p-3 text-sm">{call.lesson[lang]}</p>
          {isPro ? (
            <button type="button" onClick={ring} className="btn btn-primary mt-4 h-11 px-5 text-sm">
              <Phone className="h-4 w-4" aria-hidden /> {t("Otra llamada", "Another call")}
            </button>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href="/planes" className="btn btn-primary h-11 px-5 text-sm">
                {t("Más llamadas con Pro", "More calls with Pro")}
              </Link>
              <span className="text-sm text-ink-2">{t("o vuelve mañana para otra.", "or come back tomorrow for another.")}</span>
            </div>
          )}
          {played > 0 && loggedIn && end.xp === 0 && (
            <p className="mt-3 text-xs text-ink-2">{t("Ya ganaste el XP de llamadas de hoy (3 por día).", "You've already earned today's call XP (3 per day).")}</p>
          )}
        </div>
      )}
    </div>
  );
}
