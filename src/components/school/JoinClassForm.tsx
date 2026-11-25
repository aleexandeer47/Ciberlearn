"use client";

import { useActionState } from "react";
import { joinClass, type JoinClassState } from "@/app/actions/school";
import { useLang, useT } from "@/components/i18n/LangProvider";
import { CLASS_CONSENT_FIELD, CLASS_CONSENT_LABEL } from "@/lib/legal";

export function JoinClassForm({ defaultCode = "" }: { defaultCode?: string }) {
  const [state, action, pending] = useActionState<JoinClassState, FormData>(joinClass, {});
  const lang = useLang();
  const t = useT();
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t("Código de la clase", "Class code")}</span>
        <input
          name="code"
          required
          defaultValue={defaultCode}
          maxLength={9}
          autoComplete="off"
          autoCapitalize="characters"
          placeholder={t("Ej.: K7MPQ2", "E.g. K7MPQ2")}
          className="field text-center font-mono text-2xl uppercase tracking-[0.3em]"
        />
      </label>
      {/* Aviso de consentimiento antes de entrar: qué verá el docente */}
      <div className="rounded-2xl border border-brand/30 bg-field p-4 text-sm leading-snug text-graphite">
        <p className="font-semibold text-chalk">{t("Antes de unirte", "Before you join")}</p>
        <p className="mt-1">
          {t(
            "Tu docente podrá entrar a tu perfil y ver tu avance. Si eres menor de edad, hazlo con permiso de tu madre, padre o tutor.",
            "Your teacher will be able to open your profile and see your progress. If you're a minor, do it with permission from your parent or guardian.",
          )}
        </p>
        <label className="mt-3 flex gap-2.5">
          <input type="checkbox" name={CLASS_CONSENT_FIELD} value="si" required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
          <span>{CLASS_CONSENT_LABEL[lang]}</span>
        </label>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-bad-text">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary h-12 w-full px-6 disabled:opacity-60">
        {pending ? t("Entrando…", "Joining…") : t("Unirme a la clase", "Join the class")}
      </button>
    </form>
  );
}
