"use client";

import { useActionState, useId } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";
import { COUNTRIES } from "@/lib/ranking";

export function ProfileForm({ nickname, country, show }: { nickname: string; country: string; show: boolean }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});
  const id = useId();
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor={`${id}-n`} className="mb-1.5 block text-sm font-medium">
          Apodo público
        </label>
        <input id={`${id}-n`} name="nickname" defaultValue={nickname} required minLength={3} maxLength={20} className="field" />
        <p className="mt-1 text-xs text-fog">Es lo único que ven los demás. Nunca mostramos tu nombre ni tu correo.</p>
      </div>
      <div>
        <label htmlFor={`${id}-c`} className="mb-1.5 block text-sm font-medium">
          País
        </label>
        <select id={`${id}-c`} name="country" defaultValue={country} className="field">
          {Object.entries(COUNTRIES).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="showInRanking" defaultChecked={show} className="h-4 w-4 accent-[var(--brand)]" />
        Aparecer en el ranking
      </label>
      {state.error && <p className="rounded-xl bg-bad/15 px-3 py-2 text-sm text-bad-text">{state.error}</p>}
      {state.ok && <p className="rounded-xl bg-ok/15 px-3 py-2 text-sm text-ok">Perfil guardado.</p>}
      <button type="submit" disabled={pending} className="btn btn-primary h-11 w-full disabled:opacity-60">
        {pending ? "Guardando…" : "Guardar perfil"}
      </button>
    </form>
  );
}
