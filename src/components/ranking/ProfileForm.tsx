"use client";

import { useActionState, useId } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";
import { useT } from "@/components/i18n/LangProvider";

export function ProfileForm({
  nickname,
  country,
  show,
  countries,
}: {
  nickname: string;
  country: string;
  show: boolean;
  /** [código, nombre] ya traducidos en el servidor (así el texto coincide al hidratar) */
  countries: [string, string][];
}) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});
  const id = useId();
  const t = useT();
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor={`${id}-n`} className="mb-1.5 block text-sm font-medium">
          {t("Apodo público", "Public nickname")}
        </label>
        <input id={`${id}-n`} name="nickname" defaultValue={nickname} required minLength={3} maxLength={20} className="field" />
        <p className="mt-1 text-xs text-fog">
          {t("Es lo único que ven los demás. Nunca mostramos tu nombre ni tu correo.", "It's the only thing others see. We never show your name or email.")}
        </p>
      </div>
      <div>
        <label htmlFor={`${id}-c`} className="mb-1.5 block text-sm font-medium">
          {t("País", "Country")}
        </label>
        <select id={`${id}-c`} name="country" defaultValue={country} className="field">
          {countries.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="showInRanking" defaultChecked={show} className="h-4 w-4 accent-[var(--brand)]" />
        {t("Aparecer en el ranking", "Show me on the leaderboard")}
      </label>
      {state.error && <p className="rounded-xl bg-bad/15 px-3 py-2 text-sm text-bad-text">{state.error}</p>}
      {state.ok && <p className="rounded-xl bg-ok/15 px-3 py-2 text-sm text-ok">{t("Perfil guardado.", "Profile saved.")}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary h-11 w-full disabled:opacity-60">
        {pending ? t("Guardando…", "Saving…") : t("Guardar perfil", "Save profile")}
      </button>
    </form>
  );
}
