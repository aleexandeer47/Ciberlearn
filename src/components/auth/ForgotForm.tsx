"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState, useId } from "react";
import { requestPasswordReset, type ForgotState } from "@/app/actions/password";

export function ForgotForm() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(requestPasswordReset, {});
  const id = useId();

  if (state.done) {
    return (
      <div className="pop-in space-y-4" aria-live="polite">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-desk-3 text-accent" aria-hidden>
          <MailCheck className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <p className="leading-relaxed">
          Si ese correo tiene una cuenta, te enviamos un enlace para elegir una contraseña nueva. Vence en 1 hora.
        </p>
        <p className="text-sm text-fog">Revisa también la carpeta de spam.</p>
        {state.devLink && (
          <div className="rounded-xl border border-dashed border-accent/50 bg-hl/10 p-4 text-sm">
            <p className="font-semibold text-accent">Modo desarrollo: no hay servicio de correo configurado</p>
            <p className="mt-1 text-fog">Este es el enlace que llegaría por correo:</p>
            <Link href={state.devLink.replace(/^https?:\/\/[^/]+/, "")} className="mt-2 block break-all font-mono text-xs text-chalk underline">
              {state.devLink}
            </Link>
          </div>
        )}
        <Link href="/entrar" className="btn btn-ghost w-full px-6 py-3">
          Volver a entrar
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-medium">
          Correo de tu cuenta
        </label>
        <input id={`${id}-email`} name="email" type="email" required autoComplete="email" className="field" />
      </div>
      {state.error && (
        <p role="alert" className="pop-in rounded-xl bg-bad/15 px-4 py-3 text-sm text-bad-text">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full px-6 py-3.5 disabled:opacity-60">
        {pending ? "Enviando…" : "Enviarme el enlace"}
      </button>
      <p className="text-center text-sm text-fog">
        ¿La recordaste?{" "}
        <Link href="/entrar" className="text-chalk underline underline-offset-2">
          Entrar
        </Link>
      </p>
    </form>
  );
}
