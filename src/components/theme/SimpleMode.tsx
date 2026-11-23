"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useLang, useT } from "@/components/i18n/LangProvider";
import { SIMPLE_KEY } from "./theme";

const EVENT = "ciberlearn-simple-change";

function read() {
  try {
    return localStorage.getItem(SIMPLE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

export function setSimpleMode(on: boolean) {
  try {
    if (on) localStorage.setItem(SIMPLE_KEY, "1");
    else localStorage.removeItem(SIMPLE_KEY);
  } catch {}
  if (on) document.documentElement.dataset.simple = "1";
  else delete document.documentElement.dataset.simple;
  window.dispatchEvent(new Event(EVENT));
}

export const useSimpleMode = () => useSyncExternalStore(subscribe, read, () => false);

/** Botón “Aa” del encabezado: letra grande y más contraste. */
export function SimpleModeToggle() {
  const on = useSimpleMode();
  const t = useT();
  return (
    <button
      type="button"
      onClick={() => setSimpleMode(!on)}
      aria-pressed={on}
      title={on ? t("Modo sencillo activado: letra grande", "Simple mode on: large text") : t("Activar letra grande (modo sencillo)", "Turn on large text (simple mode)")}
      className={`grid h-10 w-10 place-items-center rounded-full font-display text-[15px] font-bold transition-[color,background-color] duration-150 ${
        on ? "bg-brand text-white" : "text-fog hover:bg-desk-3 hover:text-chalk"
      }`}
    >
      Aa
    </button>
  );
}

/** Botón grande para activar el modo sencillo desde una página (p. ej. /mayores). */
export function SimpleModeButton() {
  const on = useSimpleMode();
  const t = useT();
  return (
    <button type="button" onClick={() => setSimpleMode(!on)} className={`btn h-14 px-7 text-lg ${on ? "btn-ghost" : "btn-primary"}`}>
      {on ? t("Volver a la letra normal", "Back to normal text") : t("Activar letra grande", "Turn on large text")}
    </button>
  );
}

const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

/** Lee un texto en voz alta con la voz del propio navegador (no se envía a ningún servidor). */
export function ListenButton({ text, className = "" }: { text: string; className?: string }) {
  const supported = useSyncExternalStore(subscribe, canSpeak, () => false);
  const [speaking, setSpeaking] = useState(false);
  const lang = useLang();
  const t = useT();

  useEffect(() => () => {
    if (canSpeak()) window.speechSynthesis.cancel();
  }, []);

  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={() => {
        const synth = window.speechSynthesis;
        if (speaking) {
          synth.cancel();
          setSpeaking(false);
          return;
        }
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === "en" ? "en-US" : "es-US";
        const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang));
        if (voice) u.voice = voice;
        u.rate = 0.95;
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        setSpeaking(true);
        synth.speak(u);
      }}
      aria-pressed={speaking}
      className={`inline-flex items-center gap-1.5 rounded-full border border-current/20 px-3 py-1 text-xs font-semibold ${className}`}
    >
      {speaking ? <VolumeX className="h-3.5 w-3.5" aria-hidden /> : <Volume2 className="h-3.5 w-3.5" aria-hidden />}
      {speaking ? t("Detener", "Stop") : t("Escuchar", "Listen")}
    </button>
  );
}
