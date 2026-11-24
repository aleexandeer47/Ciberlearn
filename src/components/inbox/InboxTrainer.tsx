"use client";

import { AlertOctagon, ArrowLeft, Check, CircleCheck, Flag, Inbox, Link2, Paperclip, RotateCcw, Trash2, X, Zap } from "lucide-react";
import { useState } from "react";
import { finishInbox, startInbox, type FinishInbox } from "@/app/actions/inbox";
import { useT } from "@/components/i18n/LangProvider";
import type { InboxAction, Outcome, PublicInboxEmail } from "@/lib/inbox";
import { sfx } from "@/lib/sfx";

const ACTION_TONE: Record<InboxAction, string> = {
  reportar: "bg-[#f97316]/15 text-[#c2410c] dark:text-[#fdba74]",
  eliminar: "bg-desk-3 text-fog",
  seguro: "bg-ok/15 text-ok",
  abrir: "bg-bad/15 text-bad-text",
};
const OUTCOME_CLS: Record<Outcome, string> = {
  excelente: "bg-ok text-white",
  bien: "bg-[#0ea5e9] text-white",
  error: "bg-[#f59e0b] text-[#0a0f1c]",
  cayo: "bg-bad text-white",
};

const initials = (s: string) =>
  s
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export function InboxTrainer() {
  const [phase, setPhase] = useState<"idle" | "loading" | "playing" | "sending" | "done">("idle");
  const [session, setSession] = useState("");
  const [emails, setEmails] = useState<PublicInboxEmail[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [acts, setActs] = useState<Record<string, InboxAction>>({});
  const [hoverUrl, setHoverUrl] = useState("");
  const [result, setResult] = useState<Extract<FinishInbox, { ok: true }> | null>(null);
  const [error, setError] = useState("");
  const t = useT();
  const ACTION_LABEL: Record<InboxAction, string> = {
    reportar: t("Reportado", "Reported"),
    eliminar: t("Eliminado", "Deleted"),
    seguro: t("Seguro", "Safe"),
    abrir: t("Abriste el enlace", "Opened the link"),
  };
  const OUTCOME_LABEL: Record<Outcome, string> = {
    excelente: t("Excelente", "Excellent"),
    bien: t("Bien", "Good"),
    error: "Error",
    cayo: t("Caíste", "You fell for it"),
  };

  async function start() {
    setPhase("loading");
    setError("");
    const r = await startInbox();
    if (!r.ok) {
      setError(r.error);
      setPhase("idle");
      return;
    }
    setSession(r.sessionId);
    setEmails(r.emails);
    setActs({});
    setSel(r.emails[0]?.id ?? null);
    setPhase("playing");
  }

  function act(a: InboxAction) {
    if (!sel) return;
    const next = { ...acts, [sel]: a };
    if (a === "abrir") sfx.unmark();
    else sfx.mark();
    setActs(next);
    setHoverUrl("");
    // Pasa al siguiente correo sin decidir
    const pending = emails.find((e) => !next[e.id]);
    if (a !== "abrir" && pending) setSel(pending.id);
  }

  async function finish() {
    setPhase("sending");
    const r = await finishInbox(session, acts);
    if (r.ok) {
      // Si abrió algún enlace peligroso, picó el anzuelo; si no, ronda limpia.
      if (r.clicked > 0) sfx.wrong();
      else sfx.complete();
      setResult(r);
      setPhase("done");
    } else {
      setError(r.error);
      setPhase("playing");
    }
  }

  if (phase === "idle" || phase === "loading")
    return (
      <div className="rounded-3xl border border-desk-line bg-desk-2 p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-field text-brand">
          <Inbox className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </span>
        <h2 className="mt-4 font-display text-2xl">{t("Tu bandeja de hoy tiene 8 correos", "Today's inbox has 8 emails")}</h2>
        <p className="mx-auto mt-2 max-w-md text-fog">
          {t(
            "Algunos son reales y otros trampas. Revisa cada uno como lo harías en tu trabajo: reporta, elimina, marca como seguro… o abre el enlace si confías.",
            "Some are real and some are traps. Check each one as you would at work: report, delete, mark as safe… or open the link if you trust it.",
          )}
        </p>
        {error && <p className="mt-4 text-sm text-bad-text">{error}</p>}
        <button type="button" onClick={start} disabled={phase === "loading"} className="btn btn-primary mt-6 h-12 px-7 disabled:opacity-60">
          {phase === "loading" ? t("Abriendo…", "Opening…") : t("Abrir la bandeja", "Open the inbox")}
        </button>
      </div>
    );

  if (phase === "done" && result) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            [t("Puntaje", "Score"), `${result.score}/100`],
            [t("Trampas reportadas", "Traps reported"), `${result.reported} ${t("de", "of")} ${result.phishing}`],
            [t("Enlaces peligrosos abiertos", "Dangerous links opened"), String(result.clicked)],
            [t("Correos reales reportados", "Real emails reported"), String(result.falsePositives)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-3xl border border-desk-line bg-desk-2 p-5">
              <p className="text-sm text-fog">{k}</p>
              <p className="mt-2 font-display text-3xl tabular-nums">{v}</p>
            </div>
          ))}
        </div>
        {result.xp > 0 && (
          <p className="flex items-center gap-2 text-sm text-brand">
            <Zap className="h-4 w-4" aria-hidden /> +{result.xp} XP
          </p>
        )}
        <ul className="space-y-3">
          {result.items.map((x) => (
            <li key={x.id} className="rounded-2xl border border-desk-line bg-desk-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{x.subject}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${OUTCOME_CLS[x.outcome]}`}>{OUTCOME_LABEL[x.outcome]}</span>
              </div>
              <p className="mt-1 text-sm text-fog">
                {x.verdict === "phishing" ? t("Era una trampa", "It was a trap") : t("Era un correo real", "It was a real email")} · {t("tú", "you")}:{" "}
                {ACTION_LABEL[x.action].toLowerCase()}
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-graphite">{x.explain}</p>
            </li>
          ))}
        </ul>
        <div className="rounded-3xl bg-field p-5 text-sm text-graphite">
          <p className="font-semibold text-chalk">{t("Lo ideal", "Best practice")}</p>
          <p className="mt-1">
            {t(
              "Ante una trampa, repórtala: así tu equipo de TI puede avisar a los demás. Eliminarla te protege a ti, pero no al resto. Y si un correo es real, no lo reportes: los falsos positivos también cuestan tiempo.",
              "When you spot a trap, report it: that way your IT team can warn everyone else. Deleting it protects you, but not the rest. And if an email is real, don't report it: false positives cost time too.",
            )}
          </p>
        </div>
        <button type="button" onClick={start} className="btn btn-primary h-12 px-6">
          <RotateCcw className="h-4 w-4" aria-hidden /> {t("Otra bandeja", "Another inbox")}
        </button>
      </div>
    );
  }

  const current = emails.find((e) => e.id === sel) ?? null;
  const done = emails.filter((e) => acts[e.id]).length;

  return (
    <div className="overflow-hidden rounded-3xl border border-desk-line bg-desk-2">
      {/* Barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-desk-line px-4 py-3">
        <p className="flex items-center gap-2 font-semibold">
          <Inbox className="h-4 w-4 text-brand" aria-hidden /> {t("Bandeja de entrada", "Inbox")}
          <span className="text-sm font-normal text-fog">
            · {done}/{emails.length} {t("revisados", "reviewed")}
          </span>
        </p>
        <button
          type="button"
          onClick={finish}
          disabled={done < emails.length || phase === "sending"}
          className="btn btn-primary h-9 px-4 text-sm disabled:opacity-50"
        >
          {phase === "sending" ? t("Calificando…", "Scoring…") : t("Terminar y ver resultados", "Finish and see results")}
        </button>
      </div>
      {error && <p className="border-b border-desk-line px-4 py-2 text-sm text-bad-text">{error}</p>}

      <div className="grid md:grid-cols-[320px_1fr]">
        {/* Lista */}
        <ul className={`max-h-[560px] overflow-y-auto border-desk-line md:border-r ${current ? "hidden md:block" : ""}`}>
          {emails.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => setSel(e.id)}
                className={`flex w-full gap-3 border-b border-desk-line px-4 py-3 text-left transition-colors ${
                  sel === e.id ? "bg-field" : "hover:bg-desk-3"
                }`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-desk-3 text-xs font-bold">{initials(e.fromName)}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={`truncate text-sm ${acts[e.id] ? "text-fog" : "font-semibold"}`}>{e.fromName}</span>
                    <span className="shrink-0 text-xs text-fog">{e.time}</span>
                  </span>
                  <span className="block truncate text-sm">{e.subject}</span>
                  {acts[e.id] && (
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${ACTION_TONE[acts[e.id]]}`}>
                      {ACTION_LABEL[acts[e.id]]}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Lectura */}
        {current && (
          <div className="flex min-h-[560px] flex-col">
            <div className="flex flex-wrap gap-2 border-b border-desk-line px-4 py-3">
              <button type="button" onClick={() => setSel(null)} className="btn btn-ghost h-9 px-3 text-sm md:hidden" aria-label={t("Volver a la lista", "Back to the list")}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" onClick={() => act("reportar")} className="btn h-9 bg-[#f97316] px-3 text-sm text-white hover:brightness-95">
                <Flag className="h-4 w-4" aria-hidden /> {t("Reportar phishing", "Report phishing")}
              </button>
              <button type="button" onClick={() => act("eliminar")} className="btn btn-ghost h-9 px-3 text-sm">
                <Trash2 className="h-4 w-4" aria-hidden /> {t("Eliminar", "Delete")}
              </button>
              <button type="button" onClick={() => act("seguro")} className="btn btn-ghost h-9 px-3 text-sm">
                <CircleCheck className="h-4 w-4" aria-hidden /> {t("Es seguro", "It's safe")}
              </button>
            </div>
            <article className="flex-1 bg-paper p-6 text-ink">
              <h2 className="font-display text-2xl">{current.subject}</h2>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-paper-2 text-xs font-bold">{initials(current.fromName)}</span>
                <span>
                  <span className="font-semibold">{current.fromName}</span>{" "}
                  <span className="font-mono text-[13px] text-ink-2">&lt;{current.fromEmail}&gt;</span>
                  <span className="block text-xs text-ink-3">
                    {t("Para: mí", "To: me")} · {current.time}
                  </span>
                </span>
              </div>
              <div className="mt-6 space-y-3 leading-relaxed">
                {current.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {current.link && (
                <button
                  type="button"
                  onClick={() => act("abrir")}
                  onMouseEnter={() => setHoverUrl(current.link!.url)}
                  onMouseLeave={() => setHoverUrl("")}
                  onFocus={() => setHoverUrl(current.link!.url)}
                  onBlur={() => setHoverUrl("")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-3 font-semibold text-white"
                >
                  <Link2 className="h-4 w-4" aria-hidden /> {current.link.text}
                </button>
              )}
              {current.attachment && (
                <button
                  type="button"
                  onClick={() => act("abrir")}
                  className="mt-6 flex items-center gap-2 rounded-xl border border-line bg-paper-2 px-4 py-3 text-sm"
                >
                  <Paperclip className="h-4 w-4" aria-hidden /> {current.attachment}
                </button>
              )}
              {acts[current.id] === "abrir" && (
                <p className="mt-6 flex items-start gap-2 rounded-xl bg-bad-soft p-3 text-sm">
                  <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-bad" aria-hidden />
                  {current.link
                    ? t("Abriste el enlace.", "You opened the link.")
                    : t("Abriste el adjunto.", "You opened the attachment.")}{" "}
                  {t(
                    "Si confías en este correo, sigue con el siguiente; si no, puedes cambiar tu decisión antes de terminar.",
                    "If you trust this email, move on to the next one; if not, you can change your decision before finishing.",
                  )}
                </p>
              )}
            </article>
            {/* Barra de estado: como en un navegador, muestra a dónde lleva el enlace */}
            <p className="h-8 truncate border-t border-desk-line bg-desk-3 px-4 py-1.5 font-mono text-xs text-fog">
              {hoverUrl ? `→ ${hoverUrl}` : current.link ? t("Pasa el mouse sobre el botón para ver a dónde lleva", "Hover over the button to see where it goes") : ""}
            </p>
          </div>
        )}
        {!current && (
          <div className="hidden place-items-center p-10 text-fog md:grid">
            <span className="flex items-center gap-2">
              {done === emails.length ? <Check className="h-4 w-4" aria-hidden /> : <X className="h-4 w-4" aria-hidden />} {t("Elige un correo", "Choose an email")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
