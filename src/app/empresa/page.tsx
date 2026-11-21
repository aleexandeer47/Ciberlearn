import { BarChart3, Building2, Download, FileSpreadsheet, MailWarning, RefreshCw, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { leaveOrg, rotateInvite } from "@/app/actions/org";
import { AddSeats, SeatCheckout } from "@/components/business/SeatCheckout";
import { CopyLink, InviteForm, RemoveMemberButton, SimLauncher } from "@/components/business/TeamTools";
import { PageShell } from "@/components/SiteHeader";
import { BUSINESS, daysLeft, orgActive, pct, PHISH_BY_ID, PHISH_TEMPLATES } from "@/lib/business";
import { collections } from "@/lib/server/db";
import { env } from "@/lib/server/env";
import { teamReport } from "@/lib/server/org";
import { getCurrentUser, type CurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Plan Empresa",
  description: "Entrena a tu equipo contra el phishing: plan Pro para cada empleado, panel de avance, informes y simulacros.",
};

const fmt = (d: Date) => d.toLocaleDateString("es-SV", { day: "numeric", month: "short", year: "numeric" });
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function Card({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`scroll-mt-24 rounded-3xl border border-desk-line bg-desk-2 p-6 ${className}`}>
      {children}
    </section>
  );
}

function Notice({ tone, children }: { tone: "ok" | "bad"; children: ReactNode }) {
  return (
    <p
      role={tone === "bad" ? "alert" : "status"}
      className={`rounded-2xl px-4 py-3 text-sm ${tone === "ok" ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad-text"}`}
    >
      {children}
    </p>
  );
}

// ------------------------------------------------------------------ presentación (sin empresa)

const FEATURES = [
  { icon: ShieldCheck, title: "Pro para cada persona", text: "Ruta completa, vidas infinitas, mensajes avanzados, contrarreloj y certificado." },
  { icon: BarChart3, title: "Panel del encargado", text: "Quién avanza, quién va atrasado y en qué tipo de estafa falla más tu equipo." },
  { icon: MailWarning, title: "Simulacros de phishing", text: "Envía correos falsos controlados y mide quién hace clic. Quien cae aprende al instante." },
  { icon: FileSpreadsheet, title: "Informe descargable", text: "El avance de todo el equipo en una hoja de cálculo, para gerencia o auditoría." },
];

function Pitch({ user, error }: { user: CurrentUser | null; error?: string }) {
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div>
          <span className="eyebrow">Plan Empresa</span>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Tu equipo es la primera línea contra el phishing</h1>
          <p className="mt-4 max-w-xl text-lg text-fog">
            Un solo correo falso puede costarle a tu empresa una transferencia, una cuenta o la confianza de tus clientes.
            Entrena a todos con casos de El Salvador y mide el avance.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.title} className="rounded-3xl border border-desk-line bg-desk-2 p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-field text-brand">
                  <f.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="mt-3 font-semibold">{f.title}</p>
                <p className="mt-1 text-sm text-fog">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <Card id="comprar" className="lg:sticky lg:top-24">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl">Activa tu empresa</h2>
            <p className="text-sm text-fog">
              <span className="font-display text-2xl text-chalk">{usd(BUSINESS.seatPrice)}</span> por persona al año
            </p>
          </div>
          <div className="mt-5 space-y-4">
            {error && <Notice tone="bad">{error}</Notice>}
            {!user ? (
              <>
                <p className="text-sm text-graphite">
                  Crea tu cuenta (o entra) para registrar tu empresa. Tú serás el encargado y ocuparás uno de los puestos.
                </p>
                <Link href="/registro?next=/empresa" className="btn btn-primary w-full px-6 py-3.5">
                  Crear cuenta y continuar
                </Link>
                <Link href="/entrar?next=/empresa" className="btn btn-ghost w-full px-6 py-3">
                  Ya tengo cuenta
                </Link>
              </>
            ) : user.org && user.org.role === "member" ? (
              <p className="text-sm text-graphite">Ya eres parte de {user.org.name}. Para crear tu propia empresa, primero sal de esa.</p>
            ) : (
              <SeatCheckout mode="nueva" />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ empleado

function MemberView({ user, joined }: { user: CurrentUser; joined: boolean }) {
  const org = user.org!;
  return (
    <div className="mx-auto max-w-xl space-y-6">
      {joined && <Notice tone="ok">¡Listo! Ya eres parte de {org.name}.</Notice>}
      <Card>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-field text-brand">
          <Building2 className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-3xl">{org.name}</h1>
        <p className="mt-2 text-graphite">
          {org.active
            ? `Tienes el plan Pro por tu empresa hasta el ${fmt(org.paidUntil!)}.`
            : "El plan de tu empresa no está activo. Avísale a tu encargado."}
        </p>
        <p className="mt-3 text-sm text-fog">
          Tu encargado puede ver tu avance (lecciones, puntajes y resultados de simulacros) y enviarte simulacros de
          phishing. Así lo autorizaste al unirte.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/ruta" className="btn btn-primary px-5 py-3">
            Seguir con la ruta
          </Link>
          <form action={leaveOrg}>
            <button type="submit" className="btn btn-ghost px-5 py-3">
              Salir de la empresa
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------------ encargado

async function OwnerView({ user, error, joined }: { user: CurrentUser; error?: string; joined: boolean }) {
  const { orgs } = await collections();
  const org = (await orgs.findOne({ _id: user.org!._id }))!;
  const active = orgActive(org.paidUntil);

  if (!active) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <span className="eyebrow">Plan Empresa</span>
        <h1 className="font-display text-4xl">{org.name}</h1>
        {error && <Notice tone="bad">{error}</Notice>}
        <Card id="comprar">
          <h2 className="font-display text-2xl">{org.paidUntil ? "Tu plan venció" : "Falta activar tu plan"}</h2>
          <p className="mb-5 mt-1 text-sm text-fog">
            {org.paidUntil
              ? `Venció el ${fmt(org.paidUntil)}. Tu equipo sigue aquí: renueva para que vuelvan a tener Pro.`
              : "Elige cuántas personas van a entrenar y paga para activar la empresa."}
          </p>
          <SeatCheckout mode="renovar" defaultSeats={org.seats} minSeats={org.memberCount} />
        </Card>
      </div>
    );
  }

  const report = await teamReport(org._id);
  const members = report.rows.filter((r) => r.role === "member").length;
  const avgLessons = report.rows.length
    ? Math.round(report.rows.reduce((a, r) => a + pct(r.lessonsDone, report.totalLessons), 0) / report.rows.length)
    : 0;
  const inviteUrl = `${env.appUrl}/empresa/unirse/${org.inviteCode}`;
  const left = daysLeft(org.paidUntil);
  const templates = PHISH_TEMPLATES.map((t) => ({
    id: t.id,
    title: t.title,
    difficulty: t.difficulty,
    subject: t.subject(org.name),
    fromName: t.fromName(org.name),
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Panel de tu empresa</span>
          <h1 className="mt-2 font-display text-4xl">{org.name}</h1>
        </div>
        <a href="/empresa/informe" className="btn btn-ghost h-10 px-4 text-sm">
          <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Descargar informe (CSV)
        </a>
      </div>
      {error && <Notice tone="bad">{error}</Notice>}
      {joined && <Notice tone="ok">Tu plan Empresa está activo.</Notice>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Puestos usados", value: `${org.memberCount}/${org.seats}`, detail: `${org.seats - org.memberCount} libres` },
          { label: "Plan vigente hasta", value: fmt(org.paidUntil!), detail: `${left} días restantes` },
          { label: "Avance promedio de la ruta", value: `${avgLessons}%`, detail: `${report.totalLessons} lecciones en total` },
          {
            label: "Cayeron en simulacros",
            value: report.sims.sent ? `${report.sims.rate}%` : "—",
            detail: report.sims.sent ? `${report.sims.clicked} de ${report.sims.sent} correos` : "Aún no envías simulacros",
          },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-fog">{s.label}</p>
            <p className="mt-3 font-display text-3xl tabular-nums">{s.value}</p>
            <p className="mt-1 text-sm text-fog">{s.detail}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card id="invitar">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl">Invita a tu equipo</h2>
              <p className="mt-1 text-sm text-fog">
                Comparte este enlace. Cada persona entra con su propia cuenta y ocupa un puesto.
              </p>
            </div>
            <form action={rotateInvite}>
              <button type="submit" className="btn h-9 px-3 text-xs text-fog hover:text-chalk" title="El enlace anterior dejará de funcionar">
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                Nuevo enlace
              </button>
            </form>
          </div>
          <div className="mt-4 space-y-5">
            <CopyLink url={inviteUrl} />
            <InviteForm />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-xl">Puntos débiles del equipo</h2>
          <p className="mt-1 text-sm text-fog">Señales que más se les escapan en el simulador.</p>
          {report.skills.length === 0 ? (
            <p className="mt-6 text-sm text-fog">Aparecerán cuando tu equipo juegue algunas rondas del simulador.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {report.skills.slice(0, 6).map((s) => (
                <li key={s.category}>
                  <div className="flex justify-between text-sm">
                    <span>{s.label}</span>
                    <span className="tabular-nums text-fog">{s.pct}% detectadas</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-desk-3">
                    <div className={`h-full rounded-full ${s.pct < 50 ? "bg-bad" : s.pct < 75 ? "bg-[#f59e0b]" : "bg-ok"}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 p-6 pb-4">
          <Users className="h-5 w-5 text-brand" strokeWidth={1.75} aria-hidden />
          <h2 className="font-display text-xl">Equipo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-y border-desk-line bg-desk-3 text-xs text-fog">
              <tr>
                <th className="px-6 py-2.5 font-medium">Persona</th>
                <th className="px-3 py-2.5 font-medium">Ruta</th>
                <th className="px-3 py-2.5 font-medium">XP</th>
                <th className="px-3 py-2.5 font-medium">Simulador</th>
                <th className="px-3 py-2.5 font-medium">Punto débil</th>
                <th className="px-3 py-2.5 font-medium">Simulacros</th>
                <th className="px-3 py-2.5 font-medium">Última entrada</th>
                <th className="px-6 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-desk-line">
              {report.rows.map((m) => {
                const p = pct(m.lessonsDone, report.totalLessons);
                return (
                  <tr key={m.id} className="align-middle">
                    <td className="px-6 py-3">
                      <p className="font-medium">
                        {m.name}
                        {m.role === "owner" && <span className="ml-2 rounded-full bg-field px-2 py-0.5 text-[11px] font-semibold text-brand">Encargado</span>}
                      </p>
                      <p className="max-w-[240px] truncate text-xs text-fog">{m.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-desk-3">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${p}%` }} />
                        </div>
                        <span className="tabular-nums text-fog">
                          {m.lessonsDone}/{report.totalLessons}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 tabular-nums">{m.xp}</td>
                    <td className="px-3 py-3 text-fog">{m.runs ? `${m.runs} rondas · ${m.avgScore} pts` : "—"}</td>
                    <td className="px-3 py-3 text-fog">{m.weakest ?? "—"}</td>
                    <td className="px-3 py-3">
                      {m.simsSent ? (
                        <span className={m.simsClicked ? "text-bad-text" : "text-ok"}>
                          {m.simsClicked ? `Cayó ${m.simsClicked} de ${m.simsSent}` : `0 de ${m.simsSent}`}
                        </span>
                      ) : (
                        <span className="text-fog">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-fog">{m.lastLoginAt ? fmt(m.lastLoginAt) : "—"}</td>
                    <td className="px-6 py-3 text-right">{m.role === "member" && <RemoveMemberButton userId={m.id} name={m.name} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card id="simulacros">
        <div className="flex items-center gap-2">
          <MailWarning className="h-5 w-5 text-brand" strokeWidth={1.75} aria-hidden />
          <h2 className="font-display text-xl">Simulacros de phishing</h2>
        </div>
        <p className="mb-5 mt-1 max-w-2xl text-sm text-fog">
          Enviamos a tus empleados un correo que imita una estafa. Si hacen clic, llegan a una página que les explica qué
          debieron notar. Solo lo reciben quienes se unieron a tu equipo y lo autorizaron. Máximo {BUSINESS.campaignsPerDay} por
          día.
        </p>
        <SimLauncher templates={templates} members={members} />

        {report.campaigns.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-desk-line text-xs text-fog">
                <tr>
                  <th className="py-2 pr-3 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Plantilla</th>
                  <th className="px-3 py-2 font-medium">Enviados</th>
                  <th className="px-3 py-2 font-medium">Hicieron clic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-desk-line">
                {report.campaigns.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 pr-3 text-fog">{fmt(c.createdAt)}</td>
                    <td className="px-3 py-2.5">{PHISH_BY_ID.get(c.templateId)?.title ?? c.templateId}</td>
                    <td className="px-3 py-2.5 tabular-nums">{c.sent}</td>
                    <td className={`px-3 py-2.5 tabular-nums ${c.clicked ? "text-bad-text" : "text-ok"}`}>
                      {c.clicked} ({pct(c.clicked, c.sent)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card id="comprar">
          <h2 className="font-display text-xl">Agregar puestos</h2>
          <p className="mb-5 mt-1 text-sm text-fog">Pagas solo los días que faltan hasta el {fmt(org.paidUntil!)}.</p>
          <AddSeats paidUntil={org.paidUntil!.toISOString()} current={org.seats} />
        </Card>
        <Card>
          <h2 className="font-display text-xl">Renovar</h2>
          <p className="mb-5 mt-1 text-sm text-fog">Suma un año al vencimiento actual. No hay cobros automáticos.</p>
          <SeatCheckout mode="renovar" defaultSeats={org.seats} minSeats={Math.max(org.seats, org.memberCount)} />
        </Card>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ página

async function Empresa({ searchParams }: { searchParams: PageProps<"/empresa">["searchParams"] }) {
  // El panel usa la base de datos y la fecha actual: siempre por petición.
  await connection();
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error.slice(0, 200) : undefined;
  const user = await getCurrentUser();
  if (user?.org?.role === "owner") return <OwnerView user={user} error={error} joined={sp.unido === "1"} />;
  if (user?.org) return <MemberView user={user} joined={sp.unido === "1"} />;
  return (
    <>
      {sp.salida === "1" && (
        <div className="mx-auto mb-6 max-w-[1100px]">
          <Notice tone="ok">Saliste de la empresa.</Notice>
        </div>
      )}
      <Pitch user={user} error={error} />
    </>
  );
}

export default function EmpresaPage(props: PageProps<"/empresa">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-[70vh] max-w-[1100px] animate-pulse rounded-3xl bg-desk-3" />}>
        <Empresa searchParams={props.searchParams} />
      </Suspense>
    </PageShell>
  );
}
