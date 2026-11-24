// Lectura en voz alta con las voces del propio dispositivo (nada se envía a un servidor).
// Elige SIEMPRE una voz del idioma del texto y, entre ellas, la más natural disponible:
//   - Edge: "Microsoft … Online (Natural)" · Chrome: "Google español / Google US English"
//   - Safari/iPhone: voces "Premium" / "Enhanced" / Siri
// y evita las robóticas (eSpeak, voces de novedad de macOS, voces de escritorio antiguas).
// Si el dispositivo no tiene ninguna voz en ese idioma, no lee en otro idioma: avisa.

import type { Lang } from "@/lib/i18n";

/** Variantes preferidas por idioma, en orden (Latinoamérica primero para español). */
const PREFERRED: Record<Lang, string[]> = {
  es: ["es-us", "es-mx", "es-419", "es-co", "es-ar", "es-cl", "es-pe", "es-es"],
  en: ["en-us", "en-gb", "en-ca", "en-au", "en-ie", "en-nz", "en-in"],
};

const NATURAL = /natural|neural|online|premium|enhanced|siri|wavenet|studio|journey/i;
// Palabras completas (\b): voces sintéticas antiguas y las de "novedad" de macOS (también en español).
const ROBOTIC =
  /espeak|e-speak|\b(robot|zarvox|trinoids|whisper|bad news|good news|bells|boing|bubbles|cellos|wobble|jester|organ|superstar|junior|ralph|kathy|bahh|hysterical|albert|fred|deranged|grandma|grandpa|rocko|shelley|flo|eddy|reed|sandy)\b/i;

const norm = (l: string) => l.toLowerCase().replace("_", "-");

function score(v: Pick<SpeechSynthesisVoice, "name" | "lang" | "localService">, lang: Lang): number {
  const l = norm(v.lang);
  if (!l.startsWith(lang)) return -1; // otro idioma: nunca
  if (ROBOTIC.test(v.name)) return 0;
  let s = 10;
  const i = PREFERRED[lang].indexOf(l);
  s += i >= 0 ? 20 - i : 5;
  if (NATURAL.test(v.name)) s += 60;
  else if (/google/i.test(v.name)) s += 45; // voces en línea de Chrome, bastante naturales
  else if (/microsoft/i.test(v.name)) s -= 5; // voces de escritorio de Windows: más robóticas
  if (!v.localService) s += 8; // las voces en la nube suelen sonar mejor
  return s;
}

const supported = () => typeof window !== "undefined" && "speechSynthesis" in window;

/** Las voces del navegador: en Chrome llegan un momento después de cargar la página. */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!supported()) return Promise.resolve([]);
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener("voiceschanged", done);
      clearTimeout(timer);
      resolve(synth.getVoices());
    };
    const timer = setTimeout(done, 2000);
    synth.addEventListener("voiceschanged", done);
  });
}

/** La mejor voz del idioma, o null si el dispositivo no tiene ninguna en ese idioma. */
export async function bestVoice(lang: Lang): Promise<SpeechSynthesisVoice | null> {
  return pickVoice(await loadVoices(), lang);
}

/** Elige entre una lista de voces (separado para poder probarlo). */
export function pickVoice<V extends Pick<SpeechSynthesisVoice, "name" | "lang" | "localService">>(voices: V[], lang: Lang): V | null {
  let best: V | null = null;
  let top = -1;
  for (const v of voices) {
    const s = score(v, lang);
    if (s > top) {
      top = s;
      best = v;
    }
  }
  return top >= 0 ? best : null;
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

/**
 * Lee `text` con la mejor voz de `lang`. Devuelve false si el dispositivo no tiene voz en ese
 * idioma (no se lee nada, para no leer español con voz en inglés).
 */
export async function speak(text: string, lang: Lang, o: SpeakOptions = {}): Promise<boolean> {
  if (!supported()) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const voice = await bestVoice(lang);
  if (!voice) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = o.rate ?? 1;
  // Las voces naturales suenan peor si se les cambia el tono: solo se ajusta en las demás.
  u.pitch = NATURAL.test(voice.name) || /google/i.test(voice.name) ? 1 : (o.pitch ?? 1);
  u.onstart = () => o.onStart?.();
  u.onend = u.onerror = () => o.onEnd?.();
  synth.speak(u);
  return true;
}

export function stopSpeaking() {
  if (supported()) window.speechSynthesis.cancel();
}

export const canSpeak = supported;
