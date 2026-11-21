import { ArrowUpRight, CreditCard, LogIn, LogOut, Users, Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { logout } from "@/app/actions/auth";
import { TrafficChart } from "@/components/admin/TrafficChart";
import { Logo } from "@/components/SiteHeader";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { money } from "@/lib/adminStats";
import { PLANS, isPlanId } from "@/lib/plans";
import { getAdminStats } from "@/lib/server/admin";
import { getCurrentUser } from "@/lib/server/session";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };

const fmtDate = (d: Date) => d.toLocaleDateString("es-SV", { day: "numeric", month: "short", year: "numeric" });
const fmtDay = (k: string) => new Date(`${k}T12:00:00`).toLocaleDateString("es-SV", { day: "numeric", month: "long" });
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

async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/entrar");
  // Una cuenta normal no debe saber que esta página existe.
  if (!user.isAdmin) notFound();

  const s = await getAdminStats();
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
            detail={`${money(s.revenue.realLast30)} en 30 días · ${n(s.revenue.realCount)} ventas`}
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
              {(["pro-mensual", "pro-anual"] as const).map((id) => {
                const p = s.revenue.byPlan.find((x) => x.planId === id);
                return (
                  <li key={id} className="flex items-baseline justify-between gap-3">
                    <span className="text-sm">
                      {PLANS[id].name}
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

        {/* Últimos pagos */}
        <Card flush className="overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="font-display text-xl">Últimos pagos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-y border-desk-line bg-desk-3 text-xs text-fog">
                <tr>
                  <th className="px-6 py-2.5 font-medium">Fecha</th>
                  <th className="px-3 py-2.5 font-medium">Usuario</th>
                  <th className="px-3 py-2.5 font-medium">Plan</th>
                  <th className="px-3 py-2.5 font-medium">Tipo</th>
                  <th className="px-6 py-2.5 text-right font-medium">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-desk-line">
                {s.recentPaid.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-fog">
                      Todavía no hay pagos.
                    </td>
                  </tr>
                )}
                {s.recentPaid.map((o) => {
                  const real = o.provider === "wompi" && o.livemode === true;
                  return (
                    <tr key={o.reference}>
                      <td className="whitespace-nowrap px-6 py-3 text-fog">{fmtDate(o.paidAt)}</td>
                      <td className="max-w-[240px] truncate px-3 py-3">{o.email ?? "—"}</td>
                      <td className="px-3 py-3">{isPlanId(o.planId) ? PLANS[o.planId].name : o.planId}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${real ? "bg-ok/15 text-ok" : "bg-desk-3 text-fog"}`}
                        >
                          {real ? "Real" : o.provider === "mock" ? "Simulado" : "Prueba"}
                        </span>
                      </td>
                      <td className={`px-6 py-3 text-right font-semibold tabular-nums ${real ? "" : "text-fog line-through"}`}>
                        {money(o.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="pb-6 text-xs text-fog">
          Visitas: una por navegador y por día, sin guardar datos personales. Inicios de sesión: cada vez que alguien entra
          o crea su cuenta. Ganancias: pagos aprobados por Wompi en modo productivo.
        </p>
      </main>
    </>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="mx-auto h-[80vh] w-full max-w-[1200px] animate-pulse px-6 py-10" />}>
      <Dashboard />
    </Suspense>
  );
}
