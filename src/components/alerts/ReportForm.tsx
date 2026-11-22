"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";
import { submitReport, type ReportState } from "@/app/actions/alerts";
import { REPORT_CHANNELS, REPORT_LIMITS } from "@/lib/community";

export function ReportForm() {
  const [state, action, pending] = useActionState<ReportState, FormData>(submitReport, {});
  if (state.ok)
    return (
      <p role="status" className="rounded-2xl bg-ok/15 p-4 text-sm text-ok">
        ¡Gracias! Revisaremos tu reporte antes de publicarlo. Así ayudas a que otras personas no caigan.
      </p>
    );
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">¿Por dónde te llegó?</span>
        <select name="channel" required defaultValue="" className="field">
          <option value="" disabled>
            Elige una opción
          </option>
          {REPORT_CHANNELS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Número, correo, perfil o enlace (opcional)</span>
        <input name="sender" maxLength={REPORT_LIMITS.senderMax} placeholder="Ej.: +503 7000-0000 o pago-sv.top" className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Copia el mensaje</span>
        <textarea
          name="text"
          required
          minLength={REPORT_LIMITS.textMin}
          maxLength={REPORT_LIMITS.textMax}
          rows={5}
          placeholder="Pega aquí el texto del mensaje sospechoso"
          className="field min-h-32 resize-y py-3"
        />
      </label>
      <label className="flex gap-2.5 text-sm text-graphite">
        <input type="checkbox" name="sin_datos" value="si" required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
        <span>Quité mis datos personales (mi nombre, mis números de cuenta, códigos, etc.). Entiendo que el mensaje se publicará sin mi nombre.</span>
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl bg-bad/15 px-3 py-2 text-sm text-bad-text">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary h-11 px-5 text-sm disabled:opacity-60">
        <Send className="h-4 w-4" aria-hidden />
        {pending ? "Enviando…" : "Enviar reporte"}
      </button>
    </form>
  );
}
