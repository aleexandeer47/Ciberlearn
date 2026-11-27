// Efectos de sonido del sitio, sintetizados con Web Audio (sin archivos: no pesan ni tienen derechos de autor).
// Todos cuentan la misma historia de pesca y phishing:
//   correct   "Anzuelo esquivado": burbuja que sube (el pez se escapa) + campanita brillante.
//   wrong     "Picaste": el carrete suelta hilo (clics que se frenan) + tono que cae + golpe sordo.
//   mark      "Lupa": ping de sonar al resaltar algo sospechoso (unmark, el mismo hacia abajo).
//   complete  "Fin de la ronda": carrete que recoge + arpegio de victoria.
//   alert     Revisor de mensajes: alarma (riesgo alto), aviso (medio) o campanita (bajo).
//   ring      Llamada entrante (tono de timbre clásico); hangup, el tono de colgado.
// Se respetan: el interruptor de sonido del sitio y que el navegador solo deja sonar después de un clic.

import { useSyncExternalStore } from "react";

const KEY = "ciberlearn-sound";
const EVENT = "ciberlearn-sound-change";

// ---------- Preferencia (localStorage, por navegador) ----------

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
  window.dispatchEvent(new Event(EVENT));
  if (on) sfx.correct();
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** true/false en el navegador; null en el servidor (para no pintar el ícono equivocado). */
export function useSoundEnabled(): boolean | null {
  return useSyncExternalStore(subscribe, soundEnabled, () => null);
}

// ---------- Motor ----------

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio(): { c: AudioContext; out: GainNode } | null {
  if (typeof window === "undefined" || !soundEnabled()) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(comp).connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return { c: ctx, out: master! };
  } catch {
    return null;
  }
}

interface ToneOpts {
  freq: number;
  to?: number;
  type?: OscillatorType;
  at?: number;
  dur: number;
  gain?: number;
  attack?: number;
  lowpass?: number;
}

function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + o.dur);
  const peak = o.gain ?? 0.2;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + (o.attack ?? 0.006));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  let node: AudioNode = osc;
  if (o.lowpass) {
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = o.lowpass;
    node = osc.connect(f);
  }
  node.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + o.dur + 0.02);
  return osc;
}

let noiseBuf: AudioBuffer | null = null;
function noise(c: AudioContext, out: AudioNode, o: { at?: number; dur: number; gain?: number; band?: number; q?: number }) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t0 = c.currentTime + (o.at ?? 0);
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = o.band ?? 2500;
  f.Q.value = o.q ?? 4;
  const g = c.createGain();
  g.gain.setValueAtTime(o.gain ?? 0.3, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  src.connect(f).connect(g).connect(out);
  src.start(t0);
  src.stop(t0 + o.dur + 0.01);
}

/** Clics de carrete: `n` clics que empiezan cada `from` s y terminan cada `to` s. */
function reel(c: AudioContext, out: AudioNode, n: number, from: number, to: number, at = 0, band = 3200) {
  let t = at;
  for (let i = 0; i < n; i++) {
    noise(c, out, { at: t, dur: 0.012, gain: 0.32, band, q: 6 });
    t += from + ((to - from) * i) / Math.max(1, n - 1);
  }
  return t;
}

// ---------- Sonidos ----------

let ringStop: (() => void) | null = null;

export const sfx = {
  /** Acertaste: esquivaste el anzuelo. `streak` (3 o más) suma un destello. */
  correct(streak = 0) {
    const a = audio();
    if (!a) return;
    const { c, out } = a;
    tone(c, out, { freq: 320, to: 980, dur: 0.11, gain: 0.22 }); // burbuja que sube
    tone(c, out, { freq: 784, type: "triangle", at: 0.08, dur: 0.28, gain: 0.16 });
    tone(c, out, { freq: 1175, type: "triangle", at: 0.16, dur: 0.42, gain: 0.16 });
    tone(c, out, { freq: 2350, at: 0.16, dur: 0.3, gain: 0.04 });
    if (streak >= 3) tone(c, out, { freq: 1568, type: "triangle", at: 0.26, dur: 0.45, gain: 0.12 });
  },

  /** Fallaste: picaste el anzuelo y el carrete se lleva el hilo. */
  wrong() {
    const a = audio();
    if (!a) return;
    const { c, out } = a;
    reel(c, out, 11, 0.022, 0.05, 0, 2600);
    tone(c, out, { freq: 330, to: 120, type: "sawtooth", dur: 0.5, gain: 0.1, lowpass: 900, attack: 0.02 });
    tone(c, out, { freq: 95, to: 60, at: 0.42, dur: 0.22, gain: 0.3 }); // golpe sordo: tirón del anzuelo
  },

  /** Resaltaste algo sospechoso (ping de sonar). */
  mark() {
    const a = audio();
    if (!a) return;
    tone(a.c, a.out, { freq: 1320, to: 1760, dur: 0.08, gain: 0.08 });
  },
  unmark() {
    const a = audio();
    if (!a) return;
    tone(a.c, a.out, { freq: 1100, to: 820, dur: 0.07, gain: 0.06 });
  },

  /** Terminaste una ronda o lección: recoges el hilo y suena la victoria. */
  complete() {
    const a = audio();
    if (!a) return;
    const { c, out } = a;
    const t = reel(c, out, 12, 0.045, 0.018, 0, 3600);
    [523, 659, 784, 1047].forEach((f, i) =>
      tone(c, out, { freq: f, type: "triangle", at: t + i * 0.09, dur: i === 3 ? 0.7 : 0.22, gain: 0.15 }),
    );
    tone(c, out, { freq: 2093, at: t + 0.27, dur: 0.6, gain: 0.035 });
  },

  /** Resultado del revisor de mensajes. */
  alert(level: "alto" | "medio" | "bajo") {
    const a = audio();
    if (!a) return;
    const { c, out } = a;
    if (level === "bajo") return sfx.correct();
    if (level === "medio") {
      tone(c, out, { freq: 660, type: "triangle", dur: 0.16, gain: 0.14 });
      tone(c, out, { freq: 660, type: "triangle", at: 0.2, dur: 0.22, gain: 0.14 });
      return;
    }
    // Alto: alarma de dos tonos, como la de un anzuelo detectado.
    for (let i = 0; i < 3; i++) {
      tone(c, out, { freq: 880, type: "square", at: i * 0.3, dur: 0.14, gain: 0.07, lowpass: 2200 });
      tone(c, out, { freq: 620, type: "square", at: i * 0.3 + 0.15, dur: 0.14, gain: 0.07, lowpass: 2200 });
    }
  },

  /** Timbre de llamada entrante (440 + 480 Hz), se repite hasta que se llama a stopRing. */
  ring() {
    sfx.stopRing();
    const a = audio();
    if (!a) return;
    const { c, out } = a;
    const burst = () => {
      tone(c, out, { freq: 440, dur: 1, gain: 0.07, attack: 0.02 });
      tone(c, out, { freq: 480, dur: 1, gain: 0.07, attack: 0.02 });
    };
    burst();
    const id = window.setInterval(burst, 2600);
    ringStop = () => window.clearInterval(id);
  },
  stopRing() {
    ringStop?.();
    ringStop = null;
  },

  /** Colgar: clic + tono de ocupado. */
  hangup() {
    sfx.stopRing();
    const a = audio();
    if (!a) return;
    const { c, out } = a;
    noise(c, out, { dur: 0.04, gain: 0.35, band: 1200, q: 1 });
    for (let i = 0; i < 3; i++) {
      tone(c, out, { freq: 480, at: 0.12 + i * 0.32, dur: 0.18, gain: 0.06, attack: 0.01 });
      tone(c, out, { freq: 620, at: 0.12 + i * 0.32, dur: 0.18, gain: 0.06, attack: 0.01 });
    }
  },

  // ---------- La inmersión y la batalla contra el Leviatán ----------

  /** La cámara se aleja y el pez baja: un “whoosh” de agua que se hunde. */
  dive() {
    const a = audio();
    if (!a) return;
    const { c, out } = a;
    noise(c, out, { dur: 1.4, gain: 0.18, band: 500, q: 0.7 });
    tone(c, out, { freq: 220, to: 55, dur: 1.6, gain: 0.12, attack: 0.2, lowpass: 600 });
  },

  /** El pez se transforma: un brillo que sube y estalla. */
  evolve() {
    const a = audio();
    if (!a) return;
    const { c, out } = a;
    tone(c, out, { freq: 200, to: 1600, type: "triangle", dur: 1.1, gain: 0.1, attack: 0.5 });
    [784, 988, 1319, 1568].forEach((f, i) => tone(c, out, { freq: f, type: "triangle", at: 1.05 + i * 0.07, dur: 0.6, gain: 0.12 }));
    noise(c, out, { at: 1.05, dur: 0.5, gain: 0.25, band: 6000, q: 0.8 });
  },

  /** Gruñido del Leviatán: grave, áspero y largo. */
  roar() {
    const a = audio();
    if (!a) return;
    const { c, out } = a;
    tone(c, out, { freq: 70, to: 42, type: "sawtooth", dur: 2.2, gain: 0.22, attack: 0.25, lowpass: 380 });
    tone(c, out, { freq: 92, to: 50, type: "sawtooth", dur: 2, gain: 0.14, attack: 0.3, lowpass: 300 });
    noise(c, out, { dur: 1.8, gain: 0.16, band: 160, q: 0.6 });
  },

  /** Acertaste en la batalla: esquivas y le das un golpe al Leviatán. */
  strike() {
    const a = audio();
    if (!a) return;
    const { c, out } = a;
    noise(c, out, { dur: 0.18, gain: 0.3, band: 3500, q: 1.2 });
    tone(c, out, { freq: 140, to: 60, at: 0.05, dur: 0.3, gain: 0.35 });
    tone(c, out, { freq: 60, to: 40, type: "sawtooth", at: 0.12, dur: 0.6, gain: 0.12, lowpass: 260 });
  },

  /** Te alcanzó su ataque. */
  hurt() {
    const a = audio();
    if (!a) return;
    const { c, out } = a;
    tone(c, out, { freq: 55, to: 30, dur: 0.6, gain: 0.45 });
    noise(c, out, { dur: 0.5, gain: 0.35, band: 300, q: 0.5 });
    tone(c, out, { freq: 400, to: 120, type: "square", dur: 0.35, gain: 0.06, lowpass: 900 });
  },

  /** Cuenta regresiva de la pregunta (más aguda en el último segundo). */
  tick(urgent = false) {
    const a = audio();
    if (!a) return;
    tone(a.c, a.out, { freq: urgent ? 1400 : 900, dur: 0.06, gain: urgent ? 0.1 : 0.06 });
  },
};
