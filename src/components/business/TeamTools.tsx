"use client";

import { Check, Copy, Send, UserMinus } from "lucide-react";
import { useActionState, useState } from "react";
import { inviteByEmail, launchSimulation, removeMember, type InviteState, type SimState } from "@/app/actions/org";

export function CopyLink({ url }: { url: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex gap-2">
      <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="field min-w-0 flex-1 font-mono text-sm" aria-label="Enlace de invitación" />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setDone(true);
            setTimeout(() => setDone(false), 1800);
          } catch {
            /* el campo queda seleccionable para copiar a mano */
          }
        }}
        className="btn btn-ghost shrink-0 px-4"
      >
        {done ? <Check className="h-4 w-4 text-ok" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        {done ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

export function InviteForm() {
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteByEmail, {});
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">O invítalos por correo</span>
        <textarea
          name="emails"
          rows={3}
          placeholder="ana@tuempresa.com, luis@tuempresa.com"
          className="field min-h-24 resize-y py-3"
        />
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary px-5 py-3 text-sm disabled:opacity-60">
        <Send className="h-4 w-4" aria-hidden />
        {pending ? "Enviando…" : "Enviar invitaciones"}
      </button>
      {state.error && (
        <p role="alert" className="rounded-xl bg-bad/15 px-3 py-2 text-sm text-bad-text">
          {state.error}
        </p>
      )}
      {state.sent !== undefined && !state.error && (
        <p role="status" className="rounded-xl bg-ok/15 px-3 py-2 text-sm text-ok">
          {state.sent > 0 ? `Enviamos ${state.sent} invitaciones.` : "No se pudo enviar ningún correo."}
          {!!state.failed && ` ${state.failed} no se pudieron enviar.`}
          {!!state.invalid?.length && ` Se ignoraron: ${state.invalid.join(", ")}.`}
        </p>
      )}
      {state.devLink && <p className="text-xs text-fog">Modo desarrollo sin correo: el enlace es {state.devLink}</p>}
    </form>
  );
}

export function RemoveMemberButton({ userId, name }: { userId: string; name: string }) {
  return (
    <form
      action={removeMember}
      onSubmit={(e) => {
        if (!confirm(`¿Quitar a ${name} del equipo? Perderá el plan Pro de la empresa y se liberará su puesto.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <button type="submit" className="btn h-8 px-2 text-xs text-fog hover:text-bad-text" aria-label={`Quitar a ${name}`}>
        <UserMinus className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}

export function SimLauncher({
  templates,
  members,
}: {
  templates: { id: string; title: string; difficulty: string; subject: string; fromName: string }[];
  members: number;
}) {
  const [state, action, pending] = useActionState<SimState, FormData>(launchSimulation, {});
  const [pick, setPick] = useState(templates[0]?.id);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Se enviará el simulacro a ${members} ${members === 1 ? "empleado" : "empleados"}. ¿Continuar?`)) e.preventDefault();
      }}
      className="space-y-4"
    >
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">Plantilla</legend>
        {templates.map((t) => (
          <label
            key={t.id}
            className={`cursor-pointer rounded-2xl border-2 p-4 transition-colors ${
              pick === t.id ? "border-brand bg-field" : "border-desk-line bg-desk-2 hover:border-fog/50"
            }`}
          >
            <input type="radio" name="template" value={t.id} checked={pick === t.id} onChange={() => setPick(t.id)} className="sr-only" />
            <span className="flex items-center justify-between gap-2">
              <span className="font-semibold">{t.title}</span>
              <span className="rounded-full bg-desk-3 px-2 py-0.5 text-[11px] font-semibold text-fog">{t.difficulty}</span>
            </span>
            <span className="mt-2 block text-xs text-fog">De: {t.fromName}</span>
            <span className="mt-0.5 block text-sm">“{t.subject}”</span>
          </label>
        ))}
      </fieldset>
      <button type="submit" disabled={pending || members === 0} className="btn btn-primary px-5 py-3 text-sm disabled:opacity-60">
        <Send className="h-4 w-4" aria-hidden />
        {pending ? "Enviando…" : `Enviar simulacro a ${members} ${members === 1 ? "empleado" : "empleados"}`}
      </button>
      {state.error && (
        <p role="alert" className="rounded-xl bg-bad/15 px-3 py-2 text-sm text-bad-text">
          {state.error}
        </p>
      )}
      {state.sent !== undefined && !state.error && (
        <p role="status" className="rounded-xl bg-ok/15 px-3 py-2 text-sm text-ok">
          Simulacro enviado a {state.sent} de {state.targets}. Los resultados aparecen abajo a medida que abran el correo.
        </p>
      )}
      {state.devLinks && (
        <div className="text-xs text-fog">
          Modo desarrollo sin correo. Enlaces de prueba:
          <ul className="mt-1 space-y-0.5 font-mono">
            {state.devLinks.map((l) => (
              <li key={l}>
                <a href={l} target="_blank" className="underline">
                  {l.slice(0, 28)}…
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
