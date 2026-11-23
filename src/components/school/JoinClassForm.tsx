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
      <label className="flex gap-2.5 text-sm leading-snug text-graphite">
        <input type="checkbox" name={CLASS_CONSENT_FIELD} value="si" required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
        <span>{CLASS_CONSENT_LABEL[lang]}</span>
      </label>
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
