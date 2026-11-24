import { AlertTriangle } from "lucide-react";
import { checkMessage, FLAG_TEXT } from "@/lib/checker";
import type { Lang } from "@/lib/i18n";

/**
 * Señales de alerta que detecta el analizador de "¿Es estafa?" (src/lib/checker.ts) en un mensaje
 * reportado. Sirve en el servidor (lista de alertas) y en el navegador (después de reportar).
 */
export function AlertSignals({ text, sender = "", lang, compact = false }: { text: string; sender?: string; lang: Lang; compact?: boolean }) {
  // Solo el mensaje: los consejos que agrega la moderación ("Qué hacer: no des tu tarjeta…") no son parte de la estafa
  const message = text.split(/\n\s*(?:Qué hacer|What to do|Fuente|Source):/)[0];
  const res = checkMessage(`${sender}\n${message}`);
  const L = FLAG_TEXT[lang];
  const en = lang === "en";
  if (res.flags.length === 0)
    return compact ? null : (
      <p className="text-sm text-fog">
        {en
          ? "We didn’t detect automatic warning signs, but that doesn’t make it safe: if you didn’t expect it, don’t click or reply."
          : "No detectamos señales automáticas, pero eso no lo hace seguro: si no lo esperabas, no toques enlaces ni respondas."}
      </p>
    );
  return (
    <div className={compact ? "" : "rounded-2xl bg-bad-soft p-4 text-ink"}>
      <p className={`flex items-center gap-1.5 text-sm font-semibold ${compact ? "text-fog" : "text-[#b91c1c]"}`}>
        <AlertTriangle className="h-4 w-4" aria-hidden />
        {en ? "Warning signs" : "Señales de alerta"} ({res.flags.length})
      </p>
      {compact ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {res.flags.map((f) => (
            <li key={f.id} title={L[f.id].why} className="rounded-full border border-bad/30 bg-bad/10 px-2.5 py-0.5 text-xs font-medium text-bad-text">
              {L[f.id].title}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm">
          {res.flags.map((f) => (
            <li key={f.id}>
              <strong>{L[f.id].title}.</strong> {L[f.id].why}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
