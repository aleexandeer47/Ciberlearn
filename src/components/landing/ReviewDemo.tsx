"use client";

import { Check, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/i18n/LangProvider";
import type { Lang } from "@/lib/i18n";
import { useCountUp } from "@/lib/useCountUp";

/*
 * Un correo que se revisa solo, en el orden de los tres pasos del simulador:
 * leer, resaltar lo sospechoso (con notas al margen) y poner el sello.
 * Se reproduce una vez al entrar en pantalla; "Ver de nuevo" lo repite.
 */

const COPY = {
  es: {
    steps: [
      { title: "Lee el mensaje", text: "Correos, SMS y chats ficticios basados en estafas reales que circulan hoy." },
      { title: "Resalta lo sospechoso", text: "Toca el remitente, las frases o los enlaces que te hagan dudar." },
      { title: "Pon el sello", text: "Decide si es phishing o legítimo y mira cada señal explicada." },
    ],
    notes: ["no es el dominio del banco", "te quieren apurar", "lleva a otro sitio"],
    eyebrow: "Cómo funciona",
    title: "Así se revisa un mensaje",
    lead: "Tres pasos, unos cinco minutos para toda la prueba.",
    again: "Ver de nuevo",
    aria: "Ejemplo de un correo revisado paso a paso",
    inbox: "Bandeja de entrada",
    bank: "Banco Izalco",
    from: "alertas@bancoizalco-seguro.com",
    subject: "Su cuenta será suspendida hoy",
    greeting: "Estimado cliente:",
    body: "Detectamos un acceso no reconocido. Confirme sus datos para evitar el bloqueo:",
    link: "bancoizalco.com/confirmar",
    sign: "Departamento de Seguridad",
    score: "Puntaje",
  },
  en: {
    steps: [
      { title: "Read the message", text: "Fictional emails, texts and chats based on real scams going around today." },
      { title: "Highlight what's suspicious", text: "Tap the sender, phrases or links that make you doubt." },
      { title: "Stamp it", text: "Decide whether it's phishing or legit and see every sign explained." },
    ],
    notes: ["not the bank's domain", "trying to rush you", "goes somewhere else"],
    eyebrow: "How it works",
    title: "How to review a message",
    lead: "Three steps, about five minutes for the whole test.",
    again: "Watch again",
    aria: "Example of an email reviewed step by step",
    inbox: "Inbox",
    bank: "Izalco Bank",
    from: "alerts@izalcobank-secure.com",
    subject: "Your account will be suspended today",
    greeting: "Dear customer,",
    body: "We detected an unrecognized sign-in. Confirm your details to avoid the lock:",
    link: "izalcobank.com/confirm",
    sign: "Security Department",
    score: "Score",
  },
} satisfies Record<Lang, unknown>;

// Momento (ms) en que ocurre cada cosa
const T = { read: 0, mark1: 1500, mark2: 2300, mark3: 3100, stamp: 4100, done: 4700 };

export function ReviewDemo() {
  const c = COPY[useLang()];
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [run, setRun] = useState(0); // cada reproducción remonta la tarjeta
  const [marks, setMarks] = useState(0);
  const [phase, setPhase] = useState<"idle" | "read" | "mark" | "stamp" | "done">("idle");
  const score = useCountUp(phase === "stamp" || phase === "done" ? 100 : 0, 900);

  const play = () => {
    timers.current.forEach(clearTimeout);
    setMarks(0);
    setPhase("read");
    setRun((r) => r + 1);
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(T.mark1, () => {
      setPhase("mark");
      setMarks(1);
    });
    at(T.mark2, () => setMarks(2));
    at(T.mark3, () => setMarks(3));
    at(T.stamp, () => setPhase("stamp"));
    at(T.done, () => setPhase("done"));
  };

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setMarks(3);
            setPhase("done");
          } else play();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    const t = timers.current;
    return () => {
      io.disconnect();
      t.forEach(clearTimeout);
    };
  }, []);

  const stepIndex = phase === "idle" || phase === "read" ? 0 : phase === "mark" ? 1 : 2;
  const seg = (n: number) => (marks >= n ? "marked" : "idle");
  const note = (n: number) =>
    marks >= n && (
      <span key={`${run}-${n}`} className="pencil-note pop-in ml-2 inline-block">
        ← {c.notes[n - 1]}
      </span>
    );

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <span className="eyebrow mb-4">{c.eyebrow}</span>
        <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.title}</h2>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-graphite">{c.lead}</p>
        <ol className="mt-10 space-y-2">
          {c.steps.map((s, i) => {
            const active = phase !== "idle" && i === stepIndex && phase !== "done";
            const done = phase === "done" || i < stepIndex;
            return (
              <li
                key={s.title}
                className={`relative flex gap-4 rounded-2xl p-4 transition-colors duration-200 ${active ? "bg-desk-2 shadow-[inset_0_0_0_1px_var(--desk-line)]" : ""}`}
              >
                <span
                  className={`absolute inset-y-3 left-0 w-0.5 rounded-full bg-brand transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`}
                  aria-hidden
                />
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-xs transition-colors duration-200 ${
                    done ? "border-brand bg-brand text-white" : active ? "border-brand text-brand" : "border-desk-line text-fog"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
                </span>
                <span>
                  <span className={`block font-medium transition-colors duration-200 ${active || done ? "text-chalk" : "text-fog"}`}>
                    {s.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-fog">{s.text}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          onClick={play}
          className={`btn btn-ghost mt-6 px-4 py-2 text-sm transition-opacity duration-200 ${phase === "done" ? "opacity-100" : "pointer-events-none opacity-0"}`}
          tabIndex={phase === "done" ? 0 : -1}
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          {c.again}
        </button>
      </div>

      {/* Se observa el correo (no la sección) para que en celular arranque cuando de verdad se ve */}
      <div ref={root} className="relative" aria-label={c.aria} role="img">
        <div className="orb orb-1 -right-10 -top-16 h-[340px] w-[340px]" aria-hidden />
        <div className="orb orb-2 -bottom-16 -left-10 h-[280px] w-[340px]" aria-hidden />
        <div
          key={run}
          className={`preview-card relative overflow-hidden ${phase === "stamp" ? "thud" : ""}`}
        >
          <div className="flex items-center gap-1 border-b border-line bg-paper-2 px-4 py-2.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc20]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 font-mono text-[11px] text-ink-3">{c.inbox}</span>
          </div>
          <div className="border-b border-line px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0f4c81] text-xs font-semibold text-white">BI</span>
              <div className="min-w-0">
                <p className="font-semibold">{c.bank}</p>
                <p className="font-mono text-[13px] text-ink-2">
                  &lt;<span className="seg" data-state={seg(1)}>{c.from}</span>&gt;
                  {note(1)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-lg font-semibold">
              <span className="seg" data-state={seg(2)}>{c.subject}</span>
              {note(2)}
            </p>
          </div>
          <div className="space-y-3 px-6 py-5 text-[15px] leading-relaxed">
            <p>{c.greeting}</p>
            <p>{c.body}</p>
            <p>
              <span className="seg seg-link" data-state={seg(3)}>
                {c.link}
              </span>
              {note(3)}
            </p>
            <p className="text-ink-2">{c.sign}</p>
          </div>
          {(phase === "stamp" || phase === "done") && (
            // Más abajo que en el simulador para no tapar las notas del revisor
            <div className="stamp" data-kind="phishing" style={{ top: "70%", left: "58%" }}>
              Phishing
            </div>
          )}
        </div>
        <div
          className={`absolute -bottom-5 right-6 rounded-xl border border-desk-line bg-desk-2 px-4 py-3 shadow-[0_12px_32px_-16px_var(--shadow)] transition-[opacity,transform] duration-300 ${
            phase === "stamp" || phase === "done" ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <p className="text-xs text-fog">{c.score}</p>
          <p className="font-display text-3xl tabular-nums">
            {score}
            <span className="ml-1 font-sans text-sm text-fog">/ 100</span>
          </p>
        </div>
      </div>
    </div>
  );
}
