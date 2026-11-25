import { ArrowUpRight, CreditCard, Download, Eye, LogIn, LogOut, Search, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { moderateReport } from "@/app/actions/alerts";
import { logout } from "@/app/actions/auth";
import { RefundButton } from "@/components/admin/RefundButton";
import { TrafficChart } from "@/components/admin/TrafficChart";
import { Logo } from "@/components/SiteHeader";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { money, shortUserAgent, withinRetract } from "@/lib/adminStats";
import { RETRACT_DAYS } from "@/lib/legal";
import { PLANS, isPlanId } from "@/lib/plans";
import { getAdminStats, searchAdmin } from "@/lib/server/admin";
import { aiEnabled } from "@/lib/server/ai";
import { emailConfigured } from "@/lib/server/email";
import { pushEnabled } from "@/lib/server/push";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { SITE } from "@/lib/site";

/** Estado de la configuración del servidor (variables de entorno). Muestra nombres, nunca valores. */
async function ServiceStatus() {
  const { pushSubs } = await collections();
  const subs = await pushSubs.estimatedDocumentCount();
  const mark = (ok: boolean) => (ok ? "✓" : "✗");
  const has = (k: string) => !!process.env[k];
  const list = (keys: string[]) => keys.map((k) => `${k} ${mark(has(k))}`).join(" · ");
  const rows: { name: string; ok: boolean; detail: string }[] = [
    { name: "Correos", ok: emailConfigured(), detail: "MAILJET_API_KEY + MAILJET_SECRET_KEY (o RESEND_API_KEY) y EMAIL_FROM" },
    {
      name: "Recordatorio diario",
      ok: pushEnabled() && has("CRON_SECRET"),
      detail: `${list(["NEXT_PUBLIC_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT", "CRON_SECRET"])} · ${subs} suscripciones`,
    },
    {
      name: "Chats con IA",
      ok: aiEnabled(),
      detail: `${list(["ANTHROPIC_API_KEY"])} · AI_CHAT_ENABLED=true ${mark(process.env.AI_CHAT_ENABLED === "true")}`,
    },
  ];
  return (
    <section className="rounded-3xl border border-desk-line bg-desk-2 p-5">
      <p className="text-sm font-semibold">Configuración del servidor</p>
      <ul className="mt-3 grid gap-2 text-sm md:grid-cols-3">
        {rows.map((r) => (
          <li key={r.name} className={`rounded-2xl px-4 py-3 ${r.ok ? "bg-ok/10" : "bg-bad/10"}`}>
            <p className={`font-semibold ${r.ok ? "text-ok" : "text-bad-text"}`}>
              {mark(r.ok)} {r.name}
            </p>
            <p className="mt-1 break-words font-mono text-[11px] text-fog">{r.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };

const fmtDate = (d: Date) => d.toLocaleDateString("es-SV", { day: "numeric", month: "short", year: "numeric" });
const fmtDateTime = (d: Date) =>
  d.toLocaleString("es-SV", { timeZone: "America/El_Salvador", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtDay =(k: string) => new Date(`${k}T12:00:00`).toLocaleDateString("es-SV", { day: "numeric", month: "long" });
const n = (x: number) => x.toLocaleString("es-SV");

/** `flush`: sin relleno interior, para tarjetas con tabla de borde a borde. */
function Card({ children, className = "", flush = false }: { children: ReactNode; className?: string; flush?: boolean }) {
  return (
    <section className={`rounded-3xl border border-desk-line bg-desk-2 ${flush ? "" : "p-6"} ${className}`}>{children}</section>
  );
}

function Stat({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-sm text-fog">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-field text-brand">{icon}</span>
        {label}
      </div>
      <p className="mt-4 font-display text-4xl tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-fog">{detail}</p>
    </Card>
  );
}

async function Dashboard({ searchParams }: { searchParams: PageProps<"/[lang]/admin">["searchParams"] }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/entrar");
  // Una cuenta normal no debe saber que esta página existe.
  if (!user.isAdmin) notFound();

  const raw = (await searchParams).q;
  const { scamReports } = await collections();
  const [s, q, pendingReports] = await Promise.all([
    getAdminStats(),
    searchAdmin(typeof raw === "string" ? raw : ""),
    scamReports.find({ status: "pending" }).sort({ createdAt: 1 }).limit(20).toArray(),
  ]);
  const proPct = s.users.total ? Math.round((s.users.pro / s.users.total) * 100) : 0;
  const icon = "h-4 w-4";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-desk-line bg-desk/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold">
              <Logo />
              {SITE.name}
            </Link>
            <span className="rounded-full bg-field px-2.5 py-0.5 text-xs font-semibold text-brand">Admin</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="hidden text-sm text-fog md:inline">{user.email}</span>
            <ThemeToggle />
            <Link href="/" className="btn btn-ghost h-9 px-3 text-sm">
              Ver sitio
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </Link>
            <form action={logout}>
              <button type="submit" className="btn h-9 px-3 text-sm text-fog hover:text-chalk" aria-label="Cerrar sesión">
                <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 space-y-6 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="eyebrow">Panel de administración</span>
            <h1 className="mt-2 font-display text-4xl">Resumen</h1>
          </div>
          <p className="text-sm text-fog">
            {s.countingSince ? `Visitas contadas desde el ${fmtDay(s.countingSince)}` : "Aún no hay visitas contadas"}
          </p>
        </div>

        {/* Servicios: si cada uno tiene su configuración en el servidor (solo sí/no, nunca los valores) */}
        <ServiceStatus />

        {/* Cifras principales */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={<Eye className={icon} strokeWidth={1.75} />}
            label="Visitas hoy"
            value={n(s.traffic.visitsToday)}
            detail={`${n(s.traffic.visits7)} en 7 días · ${n(s.traffic.visits30)} en 30`}
          />
          <Stat
            icon={<LogIn className={icon} strokeWidth={1.75} />}
            label="Inicios de sesión, 30 días"
            value={n(s.traffic.logins30)}
            detail={`${n(s.traffic.loginsToday)} hoy · ${n(s.traffic.logins7)} en 7 días`}
          />
          <Stat
            icon={<Users className={icon} strokeWidth={1.75} />}
            label="Usuarios registrados"
            value={n(s.users.total)}
            detail={
              <>
                <span className="font-medium text-ok">+{n(s.users.new7)}</span> esta semana · +{n(s.users.new30)} en 30 días
              </>
            }
          />
          <Stat
            icon={<CreditCard className={icon} strokeWidth={1.75} />}
            label="Ganancias totales"
            value={money(s.revenue.realTotal)}
            detail={
              <>
                {money(s.revenue.realLast30)} en 30 días · {n(s.revenue.realCount)} ventas
                {s.revenue.refundCount > 0 && (
                  <span className="block">
                    {n(s.revenue.refundCount)} reembolsos por {money(s.revenue.refundedTotal)} ya descontados
                  </span>
                )}
              </>
            }
          />
        </div>

        {/* Gráfico principal + planes */}
        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <Card>
            <h2 className="font-display text-xl">Visitas por día</h2>
            <p className="mb-6 mt-1 text-sm text-fog">Últimos 30 días. Pasa el mouse por un día para ver los detalles.</p>
            <TrafficChart series={s.series} />
          </Card>

          <Card>
            <h2 className="font-display text-xl">Planes</h2>
            <p className="mt-1 text-sm text-fog">Usuarios con Pro activo hoy.</p>
            <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-desk-3" aria-hidden>
              <div className="h-full bg-brand" style={{ width: `${proPct}%` }} />
            </div>
            <dl className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                  Pro
                </dt>
                <dd className="tabular-nums">
                  <span className="font-semibold">{n(s.users.pro)}</span> <span className="text-sm text-fog">· {proPct}%</span>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-desk-line" />
                  Gratis
                </dt>
                <dd className="tabular-nums">
                  <span className="font-semibold">{n(s.users.free)}</span>{" "}
                  <span className="text-sm text-fog">· {s.users.total ? 100 - proPct : 0}%</span>
                </dd>
              </div>
            </dl>
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-desk-line pt-5">
              <div>
                <p className="font-display text-2xl tabular-nums">{n(s.users.active30)}</p>
                <p className="text-xs text-fog">jugaron en 30 días</p>
              </div>
              <div>
                <p className="font-display text-2xl tabular-nums">{n(s.runs30)}</p>
                <p className="text-xs text-fog">rondas en 30 días</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Usuarios + ventas */}
        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <Card flush className="overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="font-display text-xl">Usuarios nuevos</h2>
              <p className="mt-1 text-sm text-fog">Los últimos 8 registros.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-y border-desk-line bg-desk-3 text-xs text-fog">
                  <tr>
                    <th className="px-6 py-2.5 font-medium">Nombre</th>
                    <th className="px-3 py-2.5 font-medium">Correo</th>
                    <th className="px-3 py-2.5 font-medium">Registro</th>
                    <th className="px-3 py-2.5 font-medium">Última entrada</th>
                    <th className="px-6 py-2.5 text-right font-medium">Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-desk-line">
                  {s.recentUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-fog">
                        Todavía no hay usuarios.
                      </td>
                    </tr>
                  )}
                  {s.recentUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="px-6 py-3 font-medium">{u.name}</td>
                      <td className="max-w-[220px] truncate px-3 py-3 text-fog">{u.email}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-fog">{fmtDate(u.createdAt)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-fog">{u.lastLoginAt ? fmtDate(u.lastLoginAt) : "—"}</td>
                      <td className="px-6 py-3 text-right">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.isPro ? "bg-field text-brand" : "bg-desk-3 text-fog"
                          }`}
                        >
                          {u.isPro ? "Pro" : "Gratis"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-xl">Ventas por plan</h2>
            <p className="mt-1 text-sm text-fog">Solo pagos reales cobrados por Wompi.</p>
            <ul className="mt-5 space-y-3">
              {(["pro-mensual", "pro-anual", "familia", "empresa"] as const).map((id) => {
                const p = s.revenue.byPlan.find((x) => x.planId === id);
                return (
                  <li key={id} className="flex items-baseline justify-between gap-3">
                    <span className="text-sm">
                      {id === "empresa" ? "Empresa" : id === "familia" ? "Pro Familiar" : PLANS[id].name}
                      <span className="ml-1 text-fog">· {n(p?.count ?? 0)}</span>
                    </span>
                    <span className="font-semibold tabular-nums">{money(p?.total ?? 0)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 rounded-2xl bg-desk-3 p-4 text-sm">
              <p className="font-medium">Pagos de prueba</p>
              <p className="mt-1 text-fog">
                {n(s.revenue.testCount)} pagos simulados o de prueba por {money(s.revenue.testTotal)}. No cuentan en las
                ganancias.
              </p>
            </div>
          </Card>
        </div>

        {/* Alertas de la comunidad pendientes de revisión */}
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl">Alertas por revisar</h2>
            <Link href="/alertas" className="text-sm text-brand hover:underline">
              Ver alertas publicadas
            </Link>
          </div>
          <p className="mt-1 text-sm text-fog">
            Corrige el texto si trae datos personales (nombres, cuentas, códigos) y apruébalo. Los enlaces se muestran
            desactivados al publicarse.
          </p>
          {pendingReports.length === 0 ? (
            <p className="mt-5 text-sm text-fog">No hay reportes pendientes.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {pendingReports.map((r) => (
                <li key={r._id.toHexString()} className="rounded-2xl border border-desk-line bg-desk-3 p-4">
                  <form action={moderateReport} className="space-y-3">
                    <input type="hidden" name="id" value={r._id.toHexString()} />
                    <p className="text-xs text-fog">
                      {r.channel} · {fmtDateTime(r.createdAt)}
                    </p>
                    <input name="sender" defaultValue={r.sender} maxLength={120} className="field font-mono text-sm" aria-label="Remitente" />
                    <textarea name="text" defaultValue={r.text} rows={4} maxLength={1000} className="field resize-y py-2 text-sm" aria-label="Mensaje" />
                    <div className="flex gap-2">
                      <button type="submit" name="decision" value="approve" className="btn btn-ok h-9 px-4 text-sm">
                        Aprobar y publicar
                      </button>
                      <button type="submit" name="decision" value="reject" className="btn btn-ghost h-9 px-4 text-sm">
                        Rechazar
                      </button>
                    </div>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Búsqueda, pagos y aceptaciones */}
        <div id="buscar" className="scroll-mt-24 pt-4">
          <form method="get" action="/admin#buscar" className="flex flex-wrap items-center gap-2">
            <label htmlFor="q" className="sr-only">
              Buscar por correo o referencia
            </label>
            <div className="relative min-w-0 flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fog" aria-hidden />
              <input
                id="q"
                name="q"
                defaultValue={q.query}
                placeholder="Buscar por correo o referencia (anz_…)"
                className="field pl-10"
              />
            </div>
            <button type="submit" className="btn btn-primary px-5 py-3 text-sm">
              Buscar
            </button>
            {q.query && (
              <Link href="/admin#buscar" className="btn btn-ghost px-4 py-3 text-sm">
                Quitar filtro
              </Link>
            )}
          </form>
          <p className="mt-2 text-xs text-fog">
            {q.query ? `Resultados para “${q.query}”.` : "Sin filtro: se muestra lo más reciente."}
          </p>
        </div>

        <Card flush className="overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="font-display text-xl">Pagos</h2>
            <p className="mt-1 text-sm text-fog">
              Para reembolsar: devuelve el dinero en el panel de Wompi y luego regístralo aquí con “Reembolsar”.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-y border-desk-line bg-desk-3 text-xs text-fog">
                <tr>
                  <th className="px-6 py-2.5 font-medium">Fecha</th>
                  <th className="px-3 py-2.5 font-medium">Usuario</th>
                  <th className="px-3 py-2.5 font-medium">Plan</th>
                  <th className="px-3 py-2.5 font-medium">Tipo</th>
                  <th className="px-3 py-2.5 text-right font-medium">Monto</th>
                  <th className="px-6 py-2.5 text-right font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-desk-line">
                {q.payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-fog">
                      {q.query ? "No hay pagos que coincidan." : "Todavía no hay pagos."}
                    </td>
                  </tr>
                )}
                {q.payments.map((o) => {
                  const real = o.provider === "wompi" && o.livemode === true;
                  const inRetract = withinRetract(o.paidAt, RETRACT_DAYS);
                  return (
                    <tr key={o.reference} className="align-top">
                      <td className="whitespace-nowrap px-6 py-3 text-fog">
                        {fmtDate(o.paidAt)}
                        <p className="font-mono text-[11px] text-fog/70">{o.reference}</p>
                      </td>
                      <td className="max-w-[220px] truncate px-3 py-3">{o.email ?? "—"}</td>
                      <td className="px-3 py-3">{o.title ?? (isPlanId(o.planId) ? PLANS[o.planId].name : o.planId)}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${real ? "bg-ok/15 text-ok" : "bg-desk-3 text-fog"}`}
                        >
                          {real ? "Real" : o.provider === "mock" ? "Simulado" : "Prueba"}
                        </span>
                      </td>
                      <td className={`px-3 py-3 text-right font-semibold tabular-nums ${real ? "" : "text-fog line-through"}`}>
                        {money(o.amount)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {o.status === "refunded" && o.refund ? (
                          <div className="text-xs">
                            <span className="rounded-full bg-bad/15 px-2.5 py-0.5 font-semibold text-bad-text">
                              Reembolsado {money(o.refund.amount)}
                            </span>
                            <p className="mt-1 text-fog">
                              {fmtDateTime(o.refund.at)} ·{" "}
                              {o.refund.removedSeats
                                ? `−${o.refund.removedSeats} puestos`
                                : o.refund.removedDays
                                  ? `−${o.refund.removedDays} días`
                                  : "sin quitar acceso"}
                            </p>
                            {o.refund.note && <p className="mt-0.5 max-w-[220px] text-fog">{o.refund.note}</p>}
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <RefundButton
                              reference={o.reference}
                              amount={o.amount}
                              removeLabel={
                                o.business?.action === "agregar"
                                  ? `Quitar los ${o.business.seats} puestos de esta compra`
                                  : o.business
                                    ? `Quitar los ${o.days} días del plan ${o.planId === "familia" ? "familiar" : "Empresa"}`
                                    : `Quitar los ${o.days} días de Pro de este pago`
                              }
                              email={o.email ?? "—"}
                              inRetract={inRetract}
                            />
                            {inRetract && <span className="text-[11px] text-ok">En plazo de retracto</span>}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card flush className="overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 p-6 pb-4">
            <div>
              <h2 className="font-display text-xl">Aceptaciones de términos y privacidad</h2>
              <p className="mt-1 text-sm text-fog">
                Cada casilla marcada queda registrada por separado. {n(q.consentTotal)} en total.
              </p>
            </div>
            <a
              href={`/admin/aceptaciones${q.query ? `?q=${encodeURIComponent(q.query)}` : ""}`}
              className="btn btn-ghost h-9 px-3 text-sm"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Descargar CSV
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-y border-desk-line bg-desk-3 text-xs text-fog">
                <tr>
                  <th className="px-6 py-2.5 font-medium">Fecha y hora (SV)</th>
                  <th className="px-3 py-2.5 font-medium">Correo</th>
                  <th className="px-3 py-2.5 font-medium">Documento</th>
                  <th className="px-3 py-2.5 font-medium">Dónde</th>
                  <th className="px-3 py-2.5 font-medium">IP</th>
                  <th className="px-6 py-2.5 font-medium">Navegador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-desk-line">
                {q.consents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-fog">
                      {q.query ? "No hay aceptaciones que coincidan." : "Todavía no hay aceptaciones registradas."}
                    </td>
                  </tr>
                )}
                {q.consents.map((c) => (
                  <tr key={c.id}>
                    <td className="whitespace-nowrap px-6 py-3 tabular-nums text-fog">{fmtDateTime(c.acceptedAt)}</td>
                    <td className="max-w-[220px] truncate px-3 py-3">{c.email}</td>
                    <td className="px-3 py-3">
                      {c.document === "terminos"
                        ? "Términos"
                        : c.document === "privacidad"
                          ? "Privacidad"
                          : c.document === "clase"
                            ? "Autorización a docente"
                            : "Autorización a empresa/familia"}
                      <span className="ml-1.5 font-mono text-[11px] text-fog">v{c.version}</span>
                    </td>
                    <td className="px-3 py-3">
                      {c.source === "registro"
                        ? "Registro"
                        : c.source === "compra"
                          ? "Compra"
                          : c.source === "unirse-clase"
                            ? "Unirse a clase"
                            : "Unirse a empresa/familia"}
                      {c.orderRef && <p className="font-mono text-[11px] text-fog">{c.orderRef}</p>}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-fog">{c.ip ?? "—"}</td>
                    <td className="px-6 py-3 text-fog" title={c.userAgent ?? undefined}>
                      {shortUserAgent(c.userAgent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="pb-6 text-xs text-fog">
          Visitas: una por navegador y por día, sin guardar datos personales. Inicios de sesión: cada vez que alguien entra
          o crea su cuenta. Ganancias: pagos aprobados por Wompi en modo productivo, menos los reembolsos. Aceptaciones: el
          CSV incluye el texto exacto de cada casilla y el navegador completo, para usarlo como prueba.
        </p>
      </main>
    </>
  );
}

export default function AdminPage(props: PageProps<"/[lang]/admin">) {
  return (
    <Suspense fallback={<div className="mx-auto h-[80vh] w-full max-w-[1200px] animate-pulse px-6 py-10" />}>
      <Dashboard searchParams={props.searchParams} />
    </Suspense>
  );
}
