"use client";

import { useActionState, useId, useState } from "react";
import { resetPassword, type ResetState } from "@/app/actions/password";
import { useT } from "@/components/i18n/LangProvider";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword, {});
  const [show, setShow] = useState(false);
  const id = useId();
  const t = useT();

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor={`${id}-pw`} className="mb-1.5 block text-sm font-medium">
          {t("Contraseña nueva", "New password")}
        </label>
        <input
          id={`${id}-pw`}
          name="password"
          type={show ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          className="field"
        />
        <p className="mt-1 text-xs text-fog">{t("Mínimo 8 caracteres.", "At least 8 characters.")}</p>
      </div>
      <div>
        <label htmlFor={`${id}-confirm`} className="mb-1.5 block text-sm font-medium">
          {t("Repítela", "Repeat it")}
        </label>
        <input
          id={`${id}-confirm`}
          name="confirm"
          type={show ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          className="field"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-fog">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-[var(--accent)]" />
        {t("Mostrar contraseñas", "Show passwords")}
      </label>
      {state.error && (
        <p role="alert" className="pop-in rounded-xl bg-bad/15 px-4 py-3 text-sm text-bad-text">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full px-6 py-3.5 disabled:opacity-60">
        {pending ? t("Guardando…", "Saving…") : t("Guardar y entrar", "Save and log in")}
      </button>
      <p className="text-center text-xs text-fog">
        {t("Al cambiarla se cerrará tu sesión en los demás dispositivos.", "Changing it will log you out on your other devices.")}
      </p>
    </form>
  );
}
