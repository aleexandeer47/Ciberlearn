"use client";

import { useActionState } from "react";
import { joinClass, type JoinClassState } from "@/app/actions/school";
import { CLASS_CONSENT_FIELD, CLASS_CONSENT_LABEL } from "@/lib/legal";

export function JoinClassForm({ defaultCode = "" }: { defaultCode?: string }) {
  const [state, action, pending] = useActionState<JoinClassState, FormData>(joinClass, {});
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Código de la clase</span>
        <input
          name="code"
          required
          defaultValue={defaultCode}
          maxLength={9}
          autoComplete="off"
          autoCapitalize="characters"
          placeholder="Ej.: K7MPQ2"
          className="field text-center font-mono text-2xl uppercase tracking-[0.3em]"
        />
      </label>
      <label className="flex gap-2.5 text-sm leading-snug text-graphite">
        <input type="checkbox" name={CLASS_CONSENT_FIELD} value="si" required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
        <span>{CLASS_CONSENT_LABEL}</span>
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-bad-text">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary h-12 w-full px-6 disabled:opacity-60">
        {pending ? "Entrando…" : "Unirme a la clase"}
      </button>
    </form>
  );
}
