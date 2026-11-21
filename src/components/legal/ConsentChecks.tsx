import Link from "next/link";
import { useId } from "react";
import { CONSENT_FIELD, LEGAL } from "@/lib/legal";

/**
 * Dos casillas separadas y sin marcar: una para los términos y otra para la privacidad.
 * El texto debe coincidir en sentido con CONSENT_TEXT (src/lib/legal.ts), que es lo que se guarda.
 */
export function ConsentChecks({
  defaults,
  tone = "desk",
}: {
  defaults?: { terminos?: boolean; privacidad?: boolean };
  /** "paper": sobre la tarjeta clara del plan Pro */
  tone?: "desk" | "paper";
}) {
  const id = useId();
  const text = tone === "paper" ? "text-ink-2" : "text-graphite";
  const link = `font-medium underline underline-offset-2 ${tone === "paper" ? "text-ink" : "text-chalk"}`;
  // En la tarjeta clara la casilla nativa debe dibujarse en modo claro aunque el sitio esté en oscuro
  const box = `mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--brand)] ${tone === "paper" ? "[color-scheme:light]" : ""}`;

  return (
    <fieldset className={`space-y-2.5 text-left text-[13px] leading-snug ${text}`}>
      <legend className="sr-only">Aceptación de documentos legales</legend>
      <label htmlFor={`${id}-t`} className="flex gap-2.5">
        <input
          id={`${id}-t`}
          type="checkbox"
          name={CONSENT_FIELD.terminos}
          value="si"
          required
          defaultChecked={defaults?.terminos}
          className={box}
        />
        <span>
          He leído y acepto los{" "}
          <Link href={LEGAL.terminos.path} target="_blank" className={link}>
            Términos y condiciones
          </Link>
          , incluida la{" "}
          <Link href={LEGAL.reembolsos.path} target="_blank" className={link}>
            Política de reembolso
          </Link>
          .
        </span>
      </label>
      <label htmlFor={`${id}-p`} className="flex gap-2.5">
        <input
          id={`${id}-p`}
          type="checkbox"
          name={CONSENT_FIELD.privacidad}
          value="si"
          required
          defaultChecked={defaults?.privacidad}
          className={box}
        />
        <span>
          He leído y acepto la{" "}
          <Link href={LEGAL.privacidad.path} target="_blank" className={link}>
            Política de privacidad
          </Link>{" "}
          y el tratamiento de mis datos personales que ahí se describe.
        </span>
      </label>
    </fieldset>
  );
}
