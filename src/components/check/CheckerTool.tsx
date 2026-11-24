"use client";

import { AlertTriangle, Crown, ScanSearch, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { aiCheck, type AiCheckResult } from "@/app/actions/check";
import { useLang, useT } from "@/components/i18n/LangProvider";
import { checkMessage, FLAG_TEXT, type CheckResult } from "@/lib/checker";
import { sfx } from "@/lib/sfx";

const SAMPLES = {
  es: "Banco Izalco: su cuenta será bloqueada HOY. Verifique sus datos aquí: bancoizalco.verificar-cuenta.top y díctenos el código que le llegó por SMS.",
  en: "Izalco Bank: your account will be locked TODAY. Verify your details here: izalcobank.verify-account.top and read us the code we just sent you.",
};

/** Revisión instantánea en el navegador (gratis) y segunda opinión con IA (Pro). */
export function CheckerTool({ aiReady, isPro, loggedIn }: { aiReady: boolean; isPro: boolean; loggedIn: boolean }) {
  const lang = useLang();
  const t = useT();
  const [text, setText] = useState("");
  const [res, setRes] = useState<CheckResult | null>(null);
  const [ai, setAi] = useState<AiCheckResult | null>(null);
  const [busy, setBusy] = useState(false);

  // La extensión del navegador manda el enlace o texto después del “#t=” (no llega al servidor)
  useEffect(() => {
    const m = window.location.hash.match(/^#t=(.+)$/);
    if (!m) return;
    let shared = "";
    try {
      shared = decodeURIComponent(m[1]).slice(0, 3000);
    } catch {
      return;
    }
    history.replaceState(null, "", window.location.pathname);
    Promise.resolve().then(() => {
      setText(shared);
      setRes(checkMessage(shared));
    });
  }, []);

  const run = () => {
    setAi(null);
    const r = text.trim().length >= 10 ? checkMessage(text) : null;
    if (r) sfx.alert(r.risk);
    setRes(r);
  };

  const askAi = async () => {
    setBusy(true);
    setAi(await aiCheck(text));
    setBusy(false);
  };

  const tone = {
    alto: { cls: "bg-bad-soft text-ink", icon: ShieldAlert, color: "text-[#b91c1c]", title: t("Muy probablemente es una estafa", "Very likely a scam") },
    medio: { cls: "bg-[#fef3c7] text-ink", icon: AlertTriangle, color: "text-[#b45309]", title: t("Tiene señales sospechosas", "It has suspicious signs") },
    bajo: { cls: "bg-ok-soft text-ink", icon: ShieldCheck, color: "text-ok", title: t("No vimos señales claras de estafa", "We didn't see clear signs of a scam") },
  } as const;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-desk-line bg-desk-2 p-5 sm:p-6">
        <label htmlFor="msg" className="mb-2 block text-sm font-medium">
          {t("Pega aquí el mensaje que recibiste (correo, SMS o chat)", "Paste the message you received here (email, text or chat)")}
        </label>
        <textarea
          id="msg"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          maxLength={3000}
          placeholder={t("Incluye el remitente y los enlaces tal como aparecen.", "Include the sender and links exactly as they appear.")}
          className="field min-h-40 resize-y py-3 font-mono text-sm"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={run} disabled={text.trim().length < 10} className="btn btn-primary h-12 px-6 disabled:opacity-50">
            <ScanSearch className="h-4 w-4" aria-hidden /> {t("Revisar ahora", "Check now")}
          </button>
          <button
            type="button"
            onClick={() => {
              setText(SAMPLES[lang]);
              const r = checkMessage(SAMPLES[lang]);
              sfx.alert(r.risk);
              setRes(r);
              setAi(null);
            }}
            className="btn btn-ghost h-12 px-5 text-sm"
          >
            {t("Probar con un ejemplo", "Try an example")}
          </button>
        </div>
        <p className="mt-3 text-xs text-fog">
          {t(
            "La revisión instantánea ocurre en tu navegador: el mensaje no se envía a ningún servidor. Quita tus datos personales antes de pegarlo.",
            "The instant check runs in your browser: the message isn't sent to any server. Remove your personal data before pasting it.",
          )}
        </p>
      </div>

      {res && (
        <section aria-live="polite" className="space-y-4">
          {(() => {
            const k = tone[res.risk];
            return (
              <div className={`pop-in rounded-3xl p-6 ${k.cls}`}>
                <p className={`flex items-center gap-2 text-xl font-semibold ${k.color}`}>
                  <k.icon className="h-6 w-6" strokeWidth={2} aria-hidden /> {k.title}
                </p>
                <p className="mt-2 leading-relaxed">
                  {res.risk === "bajo"
                    ? t(
                        "Eso no garantiza que sea real: si te pide algo o no lo esperabas, confirma por el canal oficial (la app, el número de tu tarjeta o el sitio escrito por ti).",
                        "That doesn't guarantee it's real: if it asks for something or you weren't expecting it, confirm through the official channel (the app, the number on your card or the site typed by you).",
                      )
                    : t(
                        "No respondas, no abras los enlaces y no des ningún dato. Si crees que puede ser real, entra por tu cuenta a la app o llama al número oficial.",
                        "Don't reply, don't open the links and don't give any data. If you think it might be real, open the app yourself or call the official number.",
                      )}
                </p>
              </div>
            );
          })()}

          {res.flags.length > 0 && (
            <ul className="space-y-3">
              {res.flags.map((f) => (
                <li key={f.id} className="rounded-2xl border border-desk-line bg-desk-2 p-4">
                  <p className="flex items-center justify-between gap-3 font-semibold">
                    {FLAG_TEXT[lang][f.id].title}
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${f.weight >= 4 ? "bg-bad/15 text-bad-text" : "bg-desk-3 text-fog"}`}>
                      {f.weight >= 4 ? t("grave", "serious") : t("señal", "sign")}
                    </span>
                  </p>
                  <p className="mt-1 break-words font-mono text-xs text-fog">“{f.match}”</p>
                  <p className="mt-2 text-sm text-graphite">{FLAG_TEXT[lang][f.id].why}</p>
                </li>
              ))}
            </ul>
          )}

          {res.links.length > 0 && (
            <div className="rounded-2xl border border-desk-line bg-desk-2 p-4 text-sm">
              <p className="font-semibold">{t("Enlaces: a dónde llevan de verdad", "Links: where they really go")}</p>
              <ul className="mt-2 space-y-1">
                {res.links.map((l) => (
                  <li key={l.url} className="break-all font-mono text-xs">
                    <span className="text-fog">{l.url}</span> → <span className="rounded bg-hl px-1 font-semibold text-ink">{l.domain}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Segunda opinión con IA */}
          <div className="rounded-3xl border border-desk-line bg-desk-2 p-5">
            <p className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-5 w-5 text-brand" aria-hidden /> {t("Segunda opinión con IA", "Second opinion with AI")}
              <span className="inline-flex items-center gap-1 rounded-full bg-field px-2 py-0.5 text-[11px] font-semibold text-brand">
                <Crown className="h-3 w-3" aria-hidden /> Pro
              </span>
            </p>
            {!aiReady ? (
              <p className="mt-2 text-sm text-fog">{t("Muy pronto: una IA analizará el mensaje completo y te explicará qué hacer.", "Coming soon: an AI will analyze the whole message and tell you what to do.")}</p>
            ) : !loggedIn || !isPro ? (
              <p className="mt-2 text-sm text-fog">
                {t("Exclusivo del plan Pro.", "Pro plan only.")}{" "}
                <Link href="/planes" className="font-semibold text-brand hover:underline">
                  {t("Ver planes", "See plans")}
                </Link>
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm text-fog">
                  {t("Para enviarlo a la IA, el mensaje sale de tu navegador. No lo guardamos.", "To send it to the AI, the message leaves your browser. We don't store it.")}
                </p>
                <button type="button" onClick={askAi} disabled={busy} className="btn btn-primary mt-3 h-11 px-5 text-sm disabled:opacity-60">
                  {busy ? t("Analizando…", "Analyzing…") : t("Analizar con IA", "Analyze with AI")}
                </button>
              </>
            )}
            {ai && !ai.ok && <p className="mt-3 rounded-xl bg-bad/15 px-3 py-2 text-sm text-bad-text">{ai.error}</p>}
            {ai?.ok && (
              <div className="pop-in mt-4 space-y-2 text-sm">
                <p className="font-semibold">
                  {ai.verdict === "estafa" ? t("Estafa", "Scam") : ai.verdict === "sospechoso" ? t("Sospechoso", "Suspicious") : t("Parece legítimo", "Looks legitimate")} ·{" "}
                  {ai.confidence}%
                </p>
                <p className="text-graphite">{ai.summary}</p>
                {ai.signals.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-graphite">
                    {ai.signals.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                )}
                <p className="rounded-xl bg-field p-3">{ai.advice}</p>
                <p className="text-xs text-fog">{t(`Te quedan ${ai.left} revisiones hoy.`, `You have ${ai.left} checks left today.`)}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
