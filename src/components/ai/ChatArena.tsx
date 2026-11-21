"use client";

import { Bot, Lock, Phone, RotateCcw, Send, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { sendMessage, startChat, type ChatMsg } from "@/app/actions/ai";
import type { Persona } from "@/lib/ai/personas";

type PublicPersona = Pick<Persona, "id" | "title" | "description" | "from" | "channel">;

interface Props {
  personas: PublicPersona[];
  left: number;
  limit: number;
  isPro: boolean;
  configured: boolean;
}

export function ChatArena({ personas, left: initialLeft, limit, isPro, configured }: Props) {
  const [left, setLeft] = useState(initialLeft);
  const [persona, setPersona] = useState<PublicPersona | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [end, setEnd] = useState<{ status: "won" | "lost"; feedback: string; xp: number } | null>(null);
  const [tactics, setTactics] = useState<string[]>([]);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy, end]);

  const begin = async (p: PublicPersona) => {
    setError(null);
    setBusy(true);
    const r = await startChat(p.id);
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setPersona(p);
    setChatId(r.chatId);
    setMsgs(r.messages);
    setLeft(r.left);
    setEnd(null);
    setTactics([]);
  };

  const send = async () => {
    const t = text.trim();
    if (!t || !chatId || busy || end) return;
    setText("");
    setError(null);
    setMsgs((m) => [...m, { role: "user", content: t }]);
    setBusy(true);
    const r = await sendMessage(chatId, t);
    setBusy(false);
    if (!r.ok) {
      setMsgs((m) => m.slice(0, -1));
      setText(t);
      return setError(r.error);
    }
    setTactics(r.tactics);
    if (r.status === "active") setMsgs((m) => [...m, { role: "assistant", content: r.reply }]);
    else setEnd({ status: r.status, feedback: r.feedback ?? "", xp: r.xp ?? 0 });
  };

  const reset = () => {
    setPersona(null);
    setChatId(null);
    setMsgs([]);
    setEnd(null);
    setError(null);
  };

  if (!configured) {
    return (
      <div className="rounded-3xl border border-dashed border-desk-line p-10 text-center">
        <Bot className="mx-auto h-10 w-10 text-fog" strokeWidth={1.5} aria-hidden />
        <p className="mt-4 font-semibold">Los chats con IA estarán disponibles muy pronto</p>
        <p className="mt-1 text-sm text-fog">Falta configurar el servicio de IA.</p>
      </div>
    );
  }

  // Selección de escenario
  if (!persona) {
    return (
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-fog">
            {isPro ? `Te quedan ${left} de ${limit} chats hoy.` : left > 0 ? "Tienes 1 chat gratis hoy." : "Ya usaste tu chat gratis de hoy."}
          </p>
          {!isPro && (
            <Link href="/planes" className="text-sm font-semibold text-brand hover:underline">
              Chats ilimitados con Pro
            </Link>
          )}
        </div>
        {error && <p className="mb-4 rounded-xl bg-bad/15 px-4 py-3 text-sm text-bad-text">{error}</p>}
        <ul className="grid gap-4 sm:grid-cols-2">
          {personas.map((p) => {
            const Icon = p.channel === "Llamada" ? Phone : Smartphone;
            const locked = left <= 0;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => begin(p)}
                  disabled={busy || locked}
                  className="group flex h-full w-full flex-col rounded-3xl border border-desk-line bg-desk-2 p-6 text-left transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-brand active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-desk-line"
                >
                  <span className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-field text-brand">
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    {locked && <Lock className="h-4 w-4 text-fog" strokeWidth={2} aria-hidden />}
                  </span>
                  <span className="mt-4 font-display text-xl">{p.title}</span>
                  <span className="mt-1 text-sm text-fog">{p.description}</span>
                  <span className="mt-4 text-sm font-semibold text-brand">{busy ? "Preparando…" : "Empezar"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // Conversación
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="flex h-[min(72vh,680px)] flex-col overflow-hidden rounded-3xl border border-desk-line bg-desk-2">
        <div className="flex items-center gap-3 border-b border-desk-line px-5 py-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-desk-3 text-fog">
            {persona.channel === "Llamada" ? <Phone className="h-5 w-5" strokeWidth={1.75} /> : <Smartphone className="h-5 w-5" strokeWidth={1.75} />}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{persona.from}</p>
            <p className="text-xs text-fog">{persona.channel === "Llamada" ? "Llamada (transcripción)" : "Número no guardado"}</p>
          </div>
          <span className="ml-auto rounded-full bg-field px-2.5 py-1 text-xs font-semibold text-brand">Práctica con IA</span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5" aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`reveal-item flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <p
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                  m.role === "user" ? "rounded-br-md bg-brand text-white" : "rounded-tl-md bg-paper text-ink ring-1 ring-line"
                }`}
              >
                {m.content}
              </p>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <p className="rounded-2xl rounded-tl-md bg-paper px-4 py-3 ring-1 ring-line" aria-label="Escribiendo">
                <span className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-ink-3" style={{ animationDelay: `${d * 120}ms` }} />
                  ))}
                </span>
              </p>
            </div>
          )}
          {end && (
            <div className={`pop-in rounded-2xl p-5 ${end.status === "won" ? "bg-ok-soft" : "bg-bad-soft"} text-ink`}>
              <p className={`flex items-center gap-2 font-semibold ${end.status === "won" ? "text-ok" : "text-[#b91c1c]"}`}>
                {end.status === "won" ? <ShieldCheck className="h-5 w-5" strokeWidth={2} /> : <ShieldAlert className="h-5 w-5" strokeWidth={2} />}
                {end.status === "won" ? "No caíste" : "Caíste en la trampa"}
                {end.xp > 0 && <span className="ml-auto text-sm">+{end.xp} XP</span>}
              </p>
              <p className="mt-2 leading-relaxed">{end.feedback}</p>
            </div>
          )}
          <div ref={bottom} />
        </div>

        {error && <p className="mx-4 mb-2 rounded-xl bg-bad/15 px-3 py-2 text-sm text-bad-text">{error}</p>}

        {end ? (
          <div className="flex gap-2 border-t border-desk-line p-4">
            <button type="button" onClick={reset} className="btn btn-primary h-11 flex-1">
              <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden /> Otro escenario
            </button>
          </div>
        ) : (
          <form
            className="flex gap-2 border-t border-desk-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label htmlFor="ia-msg" className="sr-only">
              Tu respuesta
            </label>
            <input
              id="ia-msg"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              autoComplete="off"
              placeholder="Responde como lo harías en la vida real"
              disabled={busy}
              className="field flex-1"
            />
            <button type="submit" disabled={busy || !text.trim()} className="btn btn-primary h-12 w-12 shrink-0 p-0 disabled:opacity-50" aria-label="Enviar">
              <Send className="h-5 w-5" strokeWidth={2} />
            </button>
          </form>
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-desk-line bg-desk-2 p-5 text-sm">
          <p className="font-semibold">Cómo funciona</p>
          <p className="mt-2 text-fog">
            La IA intenta engañarte. Responde como lo harías de verdad. Ganas si no entregas datos ni dinero y cortas la estafa.
          </p>
          <p className="mt-3 text-fog">Es una práctica: nunca escribas tus datos reales.</p>
        </div>
        {tactics.length > 0 && (
          <div className="rounded-3xl border border-desk-line bg-desk-2 p-5 text-sm">
            <p className="font-semibold">Tácticas que está usando</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {tactics.slice(0, 6).map((t) => (
                <li key={t} className="rounded-full bg-bad-soft px-2.5 py-1 text-xs font-medium text-[#b91c1c]">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
