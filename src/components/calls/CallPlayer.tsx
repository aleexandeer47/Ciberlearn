"use client";

import { Lock, Phone, PhoneOff, ShieldAlert, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { finishCall } from "@/app/actions/calls";
import { useLang, useT } from "@/components/i18n/LangProvider";
import type { CallEnd, CallScenario } from "@/lib/calls";

type Phase = "pick" | "ringing" | "talking" | "end";

/** Llamada simulada: el estafador habla con la voz del navegador (nada se envía a ningún servidor). */
export function CallPlayer({ calls, unlocked, loggedIn }: { calls: CallScenario[]; unlocked: string[]; loggedIn: boolean }) {
  const lang = useLang();
  const t = useT();
  const [call, setCall] = useState<CallScenario | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [step, setStep] = useState("start");
  const [lines, setLines] = useState<{ who: "them" | "me"; text: string }[]>([]);
  const [end, setEnd] = useState<{ outcome: CallEnd; note: string; xp: number } | null>(null);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const speak = useCallback(
    (text: string) => {
      if (muted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "en" ? "en-US" : "es-US";
      const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang));
      if (voice) u.voice = voice;
      u.rate = 1;
      u.pitch = 0.9;
      u.onstart = () => setSpeaking(true);
      u.onend = u.onerror = () => setSpeaking(false);
      synth.speak(u);
    },
    [lang, muted],
  );

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);
  // Con llaves: en Chrome reciente scrollIntoView devuelve una promesa, y un efecto no puede devolver eso
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines, end]);

  const begin = (c: CallScenario) => {
    setCall(c);
    setStep("start");
    setLines([]);
    setEnd(null);
    setPhase("ringing");
    if ("vibrate" in navigator) navigator.vibrate?.([300, 200, 300]);
  };

  const answer = () => {
    if (!call) return;
    const say = call.steps.start.say[lang];
    setLines([{ who: "them", text: say }]);
    setPhase("talking");
    speak(say);
  };

  const finish = async (outcome: CallEnd, note: string) => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPhase("end");
    setEnd({ outcome, note, xp: 0 });
    if (loggedIn && call) {
      const r = await finishCall(call.id, outcome);
      setEnd({ outcome, note, xp: r.xp });
    }
  };

  const choose = (i: number) => {
    if (!call) return;
    const ch = call.steps[step].choices[i];
    setLines((l) => [...l, { who: "me", text: ch.label[lang] }]);
    if (ch.next === "fell" || ch.next === "safe") return void finish(ch.next, ch.note?.[lang] ?? "");
    const say = call.steps[ch.next].say[lang];
    setStep(ch.next);
    setTimeout(() => {
      setLines((l) => [...l, { who: "them", text: say }]);
      speak(say);
    }, 500);
  };

  if (phase === "pick" || !call) {
    return (
      <ul className="grid gap-4 sm:grid-cols-2">
        {calls.map((c) => {
          const open = unlocked.includes(c.id);
          return (
            <li key={c.id}>
              {open ? (
                <button
                  type="button"
                  onClick={() => begin(c)}
                  className="group flex h-full w-full flex-col rounded-3xl border border-desk-line bg-desk-2 p-6 text-left transition-colors hover:border-brand"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-ok/15 text-ok">
                    <Phone className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="mt-4 font-display text-xl">{c.title[lang]}</span>
                  <span className="mt-1 text-sm text-fog">{c.caller[lang]} · {c.number}</span>
                  <span className="mt-4 text-sm font-semibold text-brand">{t("Recibir la llamada →", "Take the call →")}</span>
                </button>
              ) : (
                <Link
                  href="/planes"
                  className="flex h-full flex-col rounded-3xl border border-dashed border-desk-line p-6 text-fog transition-colors hover:border-brand"
                >
                  <Lock className="h-5 w-5" aria-hidden />
                  <span className="mt-4 font-display text-xl text-chalk/70">{c.title[lang]}</span>
                  <span className="mt-1 text-sm">{t("Con Pro tienes todas las llamadas", "Pro unlocks every call")}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

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
              <button type="button" onClick={() => finish("safe", t("Si no reconoces el número, no contestar también es una buena opción.", "If you don't recognize the number, not answering is a good option too."))} className="grid h-16 w-16 place-items-center rounded-full bg-bad" aria-label={t("Rechazar", "Decline")}>
                <PhoneOff className="h-7 w-7" aria-hidden />
              </button>
              <button type="button" onClick={answer} className="grid h-16 w-16 place-items-center rounded-full bg-ok" aria-label={t("Contestar", "Answer")}>
                <Phone className="h-7 w-7" aria-hidden />
              </button>
            </div>
          )}
          {phase === "talking" &&
            call.steps[step].choices.map((ch, i) => (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                  ch.next === "safe" && /colg|hang/i.test(ch.label[lang]) ? "bg-bad/80 hover:bg-bad" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {ch.label[lang]}
              </button>
            ))}
          {phase === "talking" && (
            <div className="flex justify-between pt-1">
              <button type="button" onClick={() => setMuted((m) => !m)} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
                {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
                {muted ? t("Voz apagada", "Voice off") : t("Voz encendida", "Voice on")}
              </button>
              <button type="button" onClick={() => finish("safe", t("Colgar a tiempo es siempre la mejor respuesta.", "Hanging up in time is always the best answer."))} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#fca5a5]">
                <PhoneOff className="h-4 w-4" aria-hidden /> {t("Colgar", "Hang up")}
              </button>
            </div>
          )}
        </div>
      </div>

      {end && (
        <div className={`pop-in mt-6 rounded-3xl p-6 text-ink ${end.outcome === "safe" ? "bg-ok-soft" : "bg-bad-soft"}`}>
          <p className={`flex items-center gap-2 text-lg font-semibold ${end.outcome === "safe" ? "text-ok" : "text-[#b91c1c]"}`}>
            {end.outcome === "safe" ? <ShieldCheck className="h-5 w-5" aria-hidden /> : <ShieldAlert className="h-5 w-5" aria-hidden />}
            {end.outcome === "safe" ? t("No caíste", "You didn't fall for it") : t("Caíste en la trampa", "You fell for the trap")}
            {end.xp > 0 && <span className="ml-auto text-sm">+{end.xp} XP</span>}
          </p>
          {end.note && <p className="mt-2">{end.note}</p>}
          <p className="mt-3 rounded-2xl bg-white/60 p-3 text-sm">{call.lesson[lang]}</p>
          <button type="button" onClick={() => setPhase("pick")} className="btn btn-primary mt-4 h-11 px-5 text-sm">
            {t("Otra llamada", "Another call")}
          </button>
        </div>
      )}
    </div>
  );
}
