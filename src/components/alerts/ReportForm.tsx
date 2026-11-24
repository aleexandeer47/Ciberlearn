"use client";

import { Send } from "lucide-react";
import { useActionState, useState } from "react";
import { submitReport, type ReportState } from "@/app/actions/alerts";
import { AlertSignals } from "@/components/alerts/AlertSignals";
import { useLang, useT } from "@/components/i18n/LangProvider";
import { REPORT_CHANNEL_LABEL, REPORT_CHANNELS, REPORT_LIMITS } from "@/lib/community";

export function ReportForm() {
  // Se guarda lo que la persona reportó para mostrarle las señales de alerta de su mensaje al terminar
  const [sent, setSent] = useState<{ text: string; sender: string } | null>(null);
  const [state, action, pending] = useActionState<ReportState, FormData>(async (prev, form) => {
    setSent({ text: String(form.get("text") ?? ""), sender: String(form.get("sender") ?? "") });
    return submitReport(prev, form);
  }, {});
  const lang = useLang();
  const t = useT();
  if (state.ok)
    return (
      <div className="space-y-3">
        <p role="status" className="rounded-2xl bg-ok/15 p-4 text-sm text-ok">
          {t(
            "¡Gracias! Revisaremos tu reporte antes de publicarlo. Así ayudas a que otras personas no caigan.",
            "Thanks! We'll review your report before publishing it. You're helping others not fall for it.",
          )}
        </p>
        {sent && (
          <>
            <p className="text-sm font-medium">{t("Esto es lo que vemos en tu mensaje:", "Here’s what we see in your message:")}</p>
            <AlertSignals text={sent.text} sender={sent.sender} lang={lang} />
          </>
        )}
      </div>
    );
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t("¿Por dónde te llegó?", "Where did you get it?")}</span>
        <select name="channel" required defaultValue="" className="field">
          <option value="" disabled>
            {t("Elige una opción", "Choose an option")}
          </option>
          {REPORT_CHANNELS.map((c) => (
            <option key={c} value={c}>
              {REPORT_CHANNEL_LABEL[lang][c]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t("Número, correo, perfil o enlace (opcional)", "Number, email, profile or link (optional)")}</span>
        <input
          name="sender"
          maxLength={REPORT_LIMITS.senderMax}
          placeholder={t("Ej.: +1 555 0100 o pago-rapido.top", "E.g. +1 555 0100 or quick-pay.top")}
          className="field"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t("Copia el mensaje", "Paste the message")}</span>
        <textarea
          name="text"
          required
          minLength={REPORT_LIMITS.textMin}
          maxLength={REPORT_LIMITS.textMax}
          rows={5}
          placeholder={t("Pega aquí el texto del mensaje sospechoso", "Paste the text of the suspicious message here")}
          className="field min-h-32 resize-y py-3"
        />
      </label>
      <label className="flex gap-2.5 text-sm text-graphite">
        <input type="checkbox" name="sin_datos" value="si" required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
        <span>
          {t(
            "Quité mis datos personales (mi nombre, mis números de cuenta, códigos, etc.). Entiendo que el mensaje se publicará sin mi nombre.",
            "I removed my personal data (my name, account numbers, codes, etc.). I understand the message will be published without my name.",
          )}
        </span>
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl bg-bad/15 px-3 py-2 text-sm text-bad-text">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary h-11 px-5 text-sm disabled:opacity-60">
        <Send className="h-4 w-4" aria-hidden />
        {pending ? t("Enviando…", "Sending…") : t("Enviar reporte", "Send report")}
      </button>
    </form>
  );
}
