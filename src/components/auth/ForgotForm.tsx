"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState, useId } from "react";
import { requestPasswordReset, type ForgotState } from "@/app/actions/password";
import { useT } from "@/components/i18n/LangProvider";

export function ForgotForm() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(requestPasswordReset, {});
  const id = useId();
  const t = useT();

  if (state.done) {
    return (
      <div className="pop-in space-y-4" aria-live="polite">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-desk-3 text-accent" aria-hidden>
          <MailCheck className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <p className="leading-relaxed">
          {t(
            "Si ese correo tiene una cuenta, te enviamos un enlace para elegir una contraseña nueva. Vence en 1 hora.",
            "If that email has an account, we sent you a link to choose a new password. It expires in 1 hour.",
          )}
        </p>
        <p className="text-sm text-fog">{t("Revisa también la carpeta de spam.", "Check your spam folder too.")}</p>
        {state.devLink && (
          <div className="rounded-xl border border-dashed border-accent/50 bg-hl/10 p-4 text-sm">
            <p className="font-semibold text-accent">{t("Modo desarrollo: no hay servicio de correo configurado", "Development mode: no email service configured")}</p>
            <p className="mt-1 text-fog">{t("Este es el enlace que llegaría por correo:", "This is the link that would be emailed:")}</p>
            <Link href={state.devLink.replace(/^https?:\/\/[^/]+/, "")} className="mt-2 block break-all font-mono text-xs text-chalk underline">
              {state.devLink}
            </Link>
          </div>
        )}
        <Link href="/entrar" className="btn btn-ghost w-full px-6 py-3">
          {t("Volver a entrar", "Back to log in")}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-medium">
          {t("Correo de tu cuenta", "Your account email")}
        </label>
        <input id={`${id}-email`} name="email" type="email" required autoComplete="email" className="field" />
      </div>
      {state.error && (
        <p role="alert" className="pop-in rounded-xl bg-bad/15 px-4 py-3 text-sm text-bad-text">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full px-6 py-3.5 disabled:opacity-60">
        {pending ? t("Enviando…", "Sending…") : t("Enviarme el enlace", "Send me the link")}
      </button>
      <p className="text-center text-sm text-fog">
        {t("¿La recordaste?", "Remembered it?")}{" "}
        <Link href="/entrar" className="text-chalk underline underline-offset-2">
          {t("Entrar", "Log in")}
        </Link>
      </p>
    </form>
  );
}
