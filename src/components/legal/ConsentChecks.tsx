"use client";

import Link from "next/link";
import { useId } from "react";
import { useT } from "@/components/i18n/LangProvider";
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
  const t = useT();
  const text = tone === "paper" ? "text-ink-2" : "text-graphite";
  const link = `font-medium underline underline-offset-2 ${tone === "paper" ? "text-ink" : "text-chalk"}`;
  // En la tarjeta clara la casilla nativa debe dibujarse en modo claro aunque el sitio esté en oscuro
  const box = `mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--brand)] ${tone === "paper" ? "[color-scheme:light]" : ""}`;

  return (
    <fieldset className={`space-y-2.5 text-left text-[13px] leading-snug ${text}`}>
      <legend className="sr-only">{t("Aceptación de documentos legales", "Acceptance of legal documents")}</legend>
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
          {t("He leído y acepto los ", "I have read and accept the ")}
          <Link href={LEGAL.terminos.path} target="_blank" className={link}>
            {t("Términos y condiciones", "Terms and conditions")}
          </Link>
          {t(", incluida la ", ", including the ")}
          <Link href={LEGAL.reembolsos.path} target="_blank" className={link}>
            {t("Política de reembolso", "Refund policy")}
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
          {t("He leído y acepto la ", "I have read and accept the ")}
          <Link href={LEGAL.privacidad.path} target="_blank" className={link}>
            {t("Política de privacidad", "Privacy policy")}
          </Link>
          {t(" y el tratamiento de mis datos personales que ahí se describe.", " and the processing of my personal data described there.")}
        </span>
      </label>
    </fieldset>
  );
}
