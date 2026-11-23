"use client";

import { Check, Copy, Send, UserMinus } from "lucide-react";
import { useActionState, useState } from "react";
import {
  inviteByEmail,
  launchSimulation,
  removeMember,
  reportSuspicious,
  setMemberArea,
  type InviteState,
  type SimState,
  type SuspiciousState,
} from "@/app/actions/org";
import { useLang, useT } from "@/components/i18n/LangProvider";
import { AREAS, type AreaId } from "@/lib/business";

/** El encargado cambia el área de una persona; se guarda al elegir. */
export function AreaSelect({ userId, value, name }: { userId: string; value: AreaId | null; name: string }) {
  const lang = useLang();
  const t = useT();
  return (
    <form action={setMemberArea}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="area"
        defaultValue={value ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="field h-9 min-w-36 py-0 text-sm"
        aria-label={t(`Área de ${name}`, `Team for ${name}`)}
      >
        <option value="">{t("Sin área", "No team")}</option>
        {(Object.keys(AREAS) as AreaId[]).map((id) => (
          <option key={id} value={id}>
            {AREAS[id].label[lang]}
          </option>
        ))}
      </select>
    </form>
  );
}

/** “Reportar phishing” para empleados. */
export function ReportSuspiciousForm() {
  const [state, action, pending] = useActionState<SuspiciousState, FormData>(reportSuspicious, {});
  const t = useT();
  if (state.ok)
    return (
      <p role="status" className={`rounded-2xl p-4 text-sm ${state.simulacro ? "bg-ok/15 text-ok" : "bg-field text-graphite"}`}>
        {state.simulacro
          ? t("¡Bien visto! Era un simulacro de tu empresa y lo detectaste. Quedó registrado a tu favor.", "Well spotted! It was a drill from your company and you caught it. It's recorded in your favor.")
          : t(
              "Gracias. Le avisamos a tu encargado para que lo revise. No abras enlaces ni adjuntos de ese correo.",
              "Thanks. We let your manager know so they can check it. Don't open any links or attachments in that email.",
            )}
      </p>
    );
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t("Asunto del correo", "Email subject")}</span>
        <input name="subject" required minLength={3} maxLength={200} placeholder={t("Copia el asunto tal cual", "Copy the subject exactly")} className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t("Remitente (opcional)", "Sender (optional)")}</span>
        <input name="sender" maxLength={120} placeholder={t("Ej.: soporte@algo-raro.com", "E.g. support@something-odd.com")} className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t("¿Qué te pareció raro? (opcional)", "What seemed odd? (optional)")}</span>
        <textarea name="notes" maxLength={500} rows={2} className="field resize-y py-2" />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-bad-text">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn h-11 bg-[#f97316] px-5 text-sm text-white hover:brightness-95 disabled:opacity-60">
        {pending ? t("Enviando…", "Sending…") : t("Reportar phishing", "Report phishing")}
      </button>
    </form>
  );
}

export function CopyLink({ url }: { url: string }) {
  const [done, setDone] = useState(false);
  const t = useT();
  return (
    <div className="flex gap-2">
      <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="field min-w-0 flex-1 font-mono text-sm" aria-label={t("Enlace de invitación", "Invite link")} />
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
        {done ? t("Copiado", "Copied") : t("Copiar", "Copy")}
      </button>
    </div>
  );
}

export function InviteForm({ placeholder }: { placeholder?: string }) {
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteByEmail, {});
  const t = useT();
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t("O invítalos por correo", "Or invite them by email")}</span>
        <textarea
          name="emails"
          rows={3}
          placeholder={placeholder ?? t("ana@tuempresa.com, luis@tuempresa.com", "ana@yourcompany.com, luis@yourcompany.com")}
          className="field min-h-24 resize-y py-3"
        />
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary px-5 py-3 text-sm disabled:opacity-60">
        <Send className="h-4 w-4" aria-hidden />
        {pending ? t("Enviando…", "Sending…") : t("Enviar invitaciones", "Send invitations")}
      </button>
      {state.error && (
        <p role="alert" className="rounded-xl bg-bad/15 px-3 py-2 text-sm text-bad-text">
          {state.error}
        </p>
      )}
      {state.sent !== undefined && !state.error && (
        <p role="status" className="rounded-xl bg-ok/15 px-3 py-2 text-sm text-ok">
          {state.sent > 0 ? t(`Enviamos ${state.sent} invitaciones.`, `We sent ${state.sent} invitations.`) : t("No se pudo enviar ningún correo.", "No emails could be sent.")}
          {!!state.failed && t(` ${state.failed} no se pudieron enviar.`, ` ${state.failed} couldn't be sent.`)}
          {!!state.invalid?.length && t(` Se ignoraron: ${state.invalid.join(", ")}.`, ` Ignored: ${state.invalid.join(", ")}.`)}
        </p>
      )}
      {state.devLink && (
        <p className="text-xs text-fog">
          {t("Modo desarrollo sin correo: el enlace es", "Development mode without email: the link is")} {state.devLink}
        </p>
      )}
    </form>
  );
}

export function RemoveMemberButton({ userId, name }: { userId: string; name: string }) {
  const t = useT();
  return (
    <form
      action={removeMember}
      onSubmit={(e) => {
        if (
          !confirm(
            t(
              `¿Quitar a ${name} del equipo? Perderá el plan Pro y se liberará su puesto.`,
              `Remove ${name} from the team? They'll lose Pro and their seat will be freed up.`,
            ),
          )
        )
          e.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <button type="submit" className="btn h-8 px-2 text-xs text-fog hover:text-bad-text" aria-label={t(`Quitar a ${name}`, `Remove ${name}`)}>
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
  const t = useT();
  const people = (n: number) => (n === 1 ? t("empleado", "employee") : t("empleados", "employees"));
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(t(`Se enviará el simulacro a ${members} ${people(members)}. ¿Continuar?`, `The drill will be sent to ${members} ${people(members)}. Continue?`)))
          e.preventDefault();
      }}
      className="space-y-4"
    >
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">{t("Plantilla", "Template")}</legend>
        {templates.map((x) => (
          <label
            key={x.id}
            className={`cursor-pointer rounded-2xl border-2 p-4 transition-colors ${
              pick === x.id ? "border-brand bg-field" : "border-desk-line bg-desk-2 hover:border-fog/50"
            }`}
          >
            <input type="radio" name="template" value={x.id} checked={pick === x.id} onChange={() => setPick(x.id)} className="sr-only" />
            <span className="flex items-center justify-between gap-2">
              <span className="font-semibold">{x.title}</span>
              <span className="rounded-full bg-desk-3 px-2 py-0.5 text-[11px] font-semibold text-fog">{x.difficulty}</span>
            </span>
            <span className="mt-2 block text-xs text-fog">
              {t("De", "From")}: {x.fromName}
            </span>
            <span className="mt-0.5 block text-sm">“{x.subject}”</span>
          </label>
        ))}
      </fieldset>
      <button type="submit" disabled={pending || members === 0} className="btn btn-primary px-5 py-3 text-sm disabled:opacity-60">
        <Send className="h-4 w-4" aria-hidden />
        {pending ? t("Enviando…", "Sending…") : t(`Enviar simulacro a ${members} ${people(members)}`, `Send drill to ${members} ${people(members)}`)}
      </button>
      {state.error && (
        <p role="alert" className="rounded-xl bg-bad/15 px-3 py-2 text-sm text-bad-text">
          {state.error}
        </p>
      )}
      {state.sent !== undefined && !state.error && (
        <p role="status" className="rounded-xl bg-ok/15 px-3 py-2 text-sm text-ok">
          {t(
            `Simulacro enviado a ${state.sent} de ${state.targets}. Los resultados aparecen abajo a medida que abran el correo.`,
            `Drill sent to ${state.sent} of ${state.targets}. Results show up below as people open the email.`,
          )}
        </p>
      )}
      {state.devLinks && (
        <div className="text-xs text-fog">
          {t("Modo desarrollo sin correo. Enlaces de prueba:", "Development mode without email. Test links:")}
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
