import {
  BarChart3,
  Building2,
  Check,
  Download,
  FileSpreadsheet,
  FileText,
  Flag,
  Inbox,
  MailWarning,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { leaveOrg, rotateInvite } from "@/app/actions/org";
import { AddSeats, SeatCheckout } from "@/components/business/SeatCheckout";
import { ReadinessGauge, ReadinessHistory, ReadinessParts } from "@/components/business/Readiness";
import { AreaSelect, CopyLink, InviteForm, RemoveMemberButton, ReportSuspiciousForm, SimLauncher } from "@/components/business/TeamTools";
import { PageShell } from "@/components/SiteHeader";
import { AREAS, BUSINESS, daysLeft, DIFFICULTY_LABEL, orgActive, pct, phishTemplate, phishTemplates } from "@/lib/business";
import { defang } from "@/lib/community";
import { LOCALE, type Lang } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { lessonTitle } from "@/lib/path/content";
import { collections } from "@/lib/server/db";
import { env } from "@/lib/server/env";
import { recordReadiness, teamReport } from "@/lib/server/org";
import { getCurrentUser, type CurrentUser } from "@/lib/server/session";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    alternates: await alternatesFor("/empresa"),
    title: t("Plan Empresa", "Business plan"),
    description: t(
      "Entrena a tu equipo contra el phishing: plan Pro para cada empleado, panel de avance, informes y simulacros.",
      "Train your team against phishing: Pro for every employee, a progress dashboard, reports and drills.",
    ),
  };
}

const fmtIn = (lang: Lang) => (d: Date) => d.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "short", year: "numeric" });
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

async function Pitch({ user, error }: { user: CurrentUser | null; error?: string }) {
  const { t } = await getT();
  const FEATURES = [
    {
      icon: ShieldCheck,
      title: t("Pro para cada persona", "Pro for everyone"),
      text: t("Ruta completa, vidas infinitas, mensajes avanzados, contrarreloj y certificado.", "Full path, unlimited lives, advanced messages, time trial and certificate."),
    },
    {
      icon: BarChart3,
      title: t("Índice de preparación", "Readiness score"),
      text: t("Una cifra de 0 a 100 con su evolución mes a mes, y qué mejorar primero.", "A 0–100 score with its month-by-month trend, and what to improve first."),
    },
    {
      icon: MailWarning,
      title: t("Simulacros y reportes", "Drills and reports"),
      text: t("Envía correos falsos controlados: mide quién hace clic y quién los reporta.", "Send controlled fake emails: measure who clicks and who reports them."),
    },
    {
      icon: FileSpreadsheet,
      title: t("Informe para gerencia", "Report for management"),
      text: t("Un informe listo para imprimir o guardar en PDF, y los datos en hoja de cálculo.", "A report ready to print or save as PDF, plus the data as a spreadsheet."),
    },
    {
      icon: Inbox,
      title: t("Bandeja de entrenamiento", "Training inbox"),
      text: t("Un día de correo simulado para practicar qué reportar, qué borrar y en qué confiar.", "A simulated day of email to practice what to report, delete and trust."),
    },
    {
      icon: Users,
      title: t("Rutas por área", "Paths by team"),
      text: t("Finanzas, atención al cliente, gerencia u operaciones: las lecciones clave de cada puesto.", "Finance, customer service, management or operations: the key lessons for each role."),
    },
  ];
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div>
          <span className="eyebrow">{t("Plan Empresa", "Business plan")}</span>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            {t("Tu equipo es la primera línea contra el phishing", "Your team is the front line against phishing")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-fog">
            {t(
              "Un solo correo falso puede costarle a tu empresa una transferencia, una cuenta o la confianza de tus clientes. Entrena a todos con casos reales, en español o inglés, y mide el avance.",
              "A single fake email can cost your company a wire transfer, an account or your customers' trust. Train everyone with real-world cases, in English or Spanish, and track progress.",
            )}
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
            <h2 className="font-display text-2xl">{t("Activa tu empresa", "Activate your company")}</h2>
            <p className="text-sm text-fog">
              <span className="font-display text-2xl text-chalk">{usd(BUSINESS.seatPrice)}</span> {t("por persona al año", "per person per year")}
            </p>
          </div>
          <div className="mt-5 space-y-4">
            {error && <Notice tone="bad">{error}</Notice>}
            {!user ? (
              <>
                <p className="text-sm text-graphite">
                  {t(
                    "Crea tu cuenta (o entra) para registrar tu empresa. Tú serás el encargado y ocuparás uno de los puestos.",
                    "Create your account (or log in) to register your company. You'll be the manager and take one of the seats.",
                  )}
                </p>
                <Link href="/registro?next=/empresa" className="btn btn-primary w-full px-6 py-3.5">
                  {t("Crear cuenta y continuar", "Sign up and continue")}
                </Link>
                <Link href="/entrar?next=/empresa" className="btn btn-ghost w-full px-6 py-3">
                  {t("Ya tengo cuenta", "I already have an account")}
                </Link>
              </>
            ) : user.org && user.org.role === "member" ? (
              <p className="text-sm text-graphite">
                {t(
                  `Ya eres parte de ${user.org.name}. Para crear tu propia empresa, primero sal de esa.`,
                  `You're already part of ${user.org.name}. To create your own company, leave that one first.`,
                )}
              </p>
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

async function MemberView({ user, joined }: { user: CurrentUser; joined: boolean }) {
  const org = user.org!;
  const { lang, t } = await getT();
  const fmt = fmtIn(lang);
  const { users } = await collections();
  const doc = await users.findOne({ _id: user._id }, { projection: { path: 1 } });
  const done = new Set(doc?.path?.completed ?? []);
  const area = org.area ? AREAS[org.area] : null;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {joined && <Notice tone="ok">{t(`¡Listo! Ya eres parte de ${org.name}.`, `Done! You're now part of ${org.name}.`)}</Notice>}
      <Card>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-field text-brand">
          <Building2 className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-3xl">{org.name}</h1>
        <p className="mt-2 text-graphite">
          {org.active
            ? t(`Tienes el plan Pro por tu empresa hasta el ${fmt(org.paidUntil!)}.`, `You have Pro through your company until ${fmt(org.paidUntil!)}.`)
            : t("El plan de tu empresa no está activo. Avísale a tu encargado.", "Your company's plan isn't active. Let your manager know.")}
        </p>
        <p className="mt-3 text-sm text-fog">
          {t(
            "Tu encargado puede ver tu avance (lecciones, puntajes y resultados de simulacros) y enviarte simulacros de phishing. Así lo autorizaste al unirte.",
            "Your manager can see your progress (lessons, scores and drill results) and send you phishing drills. You allowed this when you joined.",
          )}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/ruta" className="btn btn-primary px-5 py-3">
            {t("Seguir con la ruta", "Continue the path")}
          </Link>
          <Link href="/bandeja" className="btn btn-ghost px-5 py-3">
            <Inbox className="h-4 w-4" aria-hidden /> {t("Bandeja de entrenamiento", "Training inbox")}
          </Link>
          <form action={leaveOrg}>
            <button type="submit" className="btn btn-ghost px-5 py-3">
              {t("Salir de la empresa", "Leave the company")}
            </button>
          </form>
        </div>
      </Card>

      {area && (
        <Card>
          <p className="eyebrow">{t("Tu ruta de área", "Your team path")}</p>
          <h2 className="mt-2 font-display text-2xl">{area.label[lang]}</h2>
          <p className="mt-1 text-sm text-fog">
            {area.focus[lang]}{" "}
            {t(
              "Tu encargado te asignó estas lecciones: ya están abiertas, sin seguir el orden de la ruta.",
              "Your manager assigned you these lessons: they're already open, outside the usual path order.",
            )}
          </p>
          <ul className="mt-5 space-y-2">
            {area.lessons.map((id) => {
              const title = lessonTitle(id, lang);
              const ok = done.has(id);
              return (
                <li key={id}>
                  <Link
                    href={`/ruta/${id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-desk-line bg-desk-3 px-4 py-3 transition-colors hover:border-brand"
                  >
                    <span className="font-medium">{title}</span>
                    {ok ? (
                      <span className="flex items-center gap-1 text-sm text-ok">
                        <Check className="h-4 w-4" aria-hidden /> {t("Completada", "Completed")}
                      </span>
                    ) : (
                      <span className="text-sm text-brand">{t("Empezar →", "Start →")}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-[#f97316]" aria-hidden />
          <h2 className="font-display text-xl">{t("¿Te llegó un correo sospechoso?", "Got a suspicious email?")}</h2>
        </div>
        <p className="mb-4 mt-1 text-sm text-fog">
          {t(
            "Repórtalo aquí sin abrir sus enlaces. Si era un simulacro de tu empresa, cuenta a tu favor; si no, tu encargado lo revisará.",
            "Report it here without opening its links. If it was a drill from your company, it counts in your favor; if not, your manager will look into it.",
          )}
        </p>
        <ReportSuspiciousForm />
      </Card>
    </div>
  );
}

// ------------------------------------------------------------------ encargado

async function OwnerView({ user, error, joined }: { user: CurrentUser; error?: string; joined: boolean }) {
  const { orgs } = await collections();
  const org = (await orgs.findOne({ _id: user.org!._id }))!;
  const active = orgActive(org.paidUntil);
  const { lang, t } = await getT();
  const fmt = fmtIn(lang);

  if (!active) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <span className="eyebrow">{t("Plan Empresa", "Business plan")}</span>
        <h1 className="font-display text-4xl">{org.name}</h1>
        {error && <Notice tone="bad">{error}</Notice>}
        <Card id="comprar">
          <h2 className="font-display text-2xl">{org.paidUntil ? t("Tu plan venció", "Your plan expired") : t("Falta activar tu plan", "Your plan isn't active yet")}</h2>
          <p className="mb-5 mt-1 text-sm text-fog">
            {org.paidUntil
              ? t(
                  `Venció el ${fmt(org.paidUntil)}. Tu equipo sigue aquí: renueva para que vuelvan a tener Pro.`,
                  `It expired on ${fmt(org.paidUntil)}. Your team is still here: renew so they get Pro again.`,
                )
              : t("Elige cuántas personas van a entrenar y paga para activar la empresa.", "Choose how many people will train and pay to activate your company.")}
          </p>
          <SeatCheckout mode="renovar" defaultSeats={org.seats} minSeats={org.memberCount} />
        </Card>
      </div>
    );
  }

  const report = await teamReport(org._id, lang);
  const history = await recordReadiness(org._id, report.readiness);
  const members = report.rows.filter((r) => r.role === "member").length;
  const avgLessons = report.pathPct;
  const inviteUrl = `${env.appUrl}/empresa/unirse/${org.inviteCode}`;
  const left = daysLeft(org.paidUntil);
  const templates = phishTemplates(lang).map((x) => ({
    id: x.id,
    title: x.title,
    difficulty: DIFFICULTY_LABEL[lang][x.difficulty],
    subject: x.subject(org.name),
    fromName: x.fromName(org.name),
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">{t("Panel de tu empresa", "Your company dashboard")}</span>
          <h1 className="mt-2 font-display text-4xl">{org.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/empresa/informe/imprimir" className="btn btn-primary h-10 px-4 text-sm">
            <FileText className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {t("Informe para gerencia (PDF)", "Management report (PDF)")}
          </Link>
          {/* Descarga de archivo (Route Handler), no una página: va con <a> */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/empresa/informe" className="btn btn-ghost h-10 px-4 text-sm">
            <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {t("Datos (CSV)", "Data (CSV)")}
          </a>
        </div>
      </div>
      {error && <Notice tone="bad">{error}</Notice>}
      {joined && <Notice tone="ok">{t("Tu plan Empresa está activo.", "Your Business plan is active.")}</Notice>}

      <Card>
        <div className="grid items-center gap-8 md:grid-cols-[auto_1fr_1fr]">
          <div className="text-center">
            <p className="mb-2 text-sm text-fog">{t("Índice de preparación", "Readiness score")}</p>
            <ReadinessGauge score={report.readiness} />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">{t("De qué depende", "What it's based on")}</p>
            <ReadinessParts input={report.readinessInput} />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">{t("Evolución mensual", "Monthly trend")}</p>
            <ReadinessHistory history={history} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t("Puestos usados", "Seats used"),
            value: `${org.memberCount}/${org.seats}`,
            detail: t(`${org.seats - org.memberCount} libres`, `${org.seats - org.memberCount} free`),
          },
          { label: t("Plan vigente hasta", "Plan active until"), value: fmt(org.paidUntil!), detail: t(`${left} días restantes`, `${left} days left`) },
          {
            label: t("Avance promedio de la ruta", "Average path progress"),
            value: `${avgLessons}%`,
            detail: t(`${report.totalLessons} lecciones en total`, `${report.totalLessons} lessons in total`),
          },
          {
            label: t("Cayeron en simulacros", "Fell for drills"),
            value: report.sims.sent ? `${report.sims.rate}%` : "—",
            detail: report.sims.sent
              ? t(
                  `${report.sims.clicked} clics · ${report.sims.reported} reportados de ${report.sims.sent}`,
                  `${report.sims.clicked} clicks · ${report.sims.reported} reported of ${report.sims.sent}`,
                )
              : t("Aún no envías simulacros", "No drills sent yet"),
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
              <h2 className="font-display text-xl">{t("Invita a tu equipo", "Invite your team")}</h2>
              <p className="mt-1 text-sm text-fog">
                {t("Comparte este enlace. Cada persona entra con su propia cuenta y ocupa un puesto.", "Share this link. Each person joins with their own account and takes one seat.")}
              </p>
            </div>
            <form action={rotateInvite}>
              <button
                type="submit"
                className="btn h-9 shrink-0 whitespace-nowrap px-3 text-xs text-fog hover:text-chalk"
                title={t("El enlace anterior dejará de funcionar", "The previous link will stop working")}
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                {t("Nuevo enlace", "New link")}
              </button>
            </form>
          </div>
          <div className="mt-4 space-y-5">
            <CopyLink url={inviteUrl} />
            <InviteForm />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-xl">{t("Puntos débiles del equipo", "Team weak spots")}</h2>
          <p className="mt-1 text-sm text-fog">{t("Señales que más se les escapan en el simulador.", "The signs they miss most in the simulator.")}</p>
          {report.skills.length === 0 ? (
            <p className="mt-6 text-sm text-fog">
              {t("Aparecerán cuando tu equipo juegue algunas rondas del simulador.", "They'll show up once your team plays a few simulator rounds.")}
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {report.skills.slice(0, 6).map((s) => (
                <li key={s.category}>
                  <div className="flex justify-between text-sm">
                    <span>{s.label}</span>
                    <span className="tabular-nums text-fog">
                      {s.pct}% {t("detectadas", "spotted")}
                    </span>
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
          <h2 className="font-display text-xl">{t("Equipo", "Team")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-y border-desk-line bg-desk-3 text-xs text-fog">
              <tr>
                <th className="px-6 py-2.5 font-medium">{t("Persona", "Person")}</th>
                <th className="px-3 py-2.5 font-medium">{t("Área", "Team")}</th>
                <th className="px-3 py-2.5 font-medium">{t("Ruta", "Path")}</th>
                <th className="px-3 py-2.5 font-medium">XP</th>
                <th className="px-3 py-2.5 font-medium">{t("Bandeja", "Inbox")}</th>
                <th className="px-3 py-2.5 font-medium">{t("Punto débil", "Weak spot")}</th>
                <th className="px-3 py-2.5 font-medium">{t("Simulacros", "Drills")}</th>
                <th className="px-3 py-2.5 font-medium">{t("Última entrada", "Last login")}</th>
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
                        {m.role === "owner" && <span className="ml-2 rounded-full bg-field px-2 py-0.5 text-[11px] font-semibold text-brand">{t("Encargado", "Manager")}</span>}
                      </p>
                      <p className="max-w-[240px] truncate text-xs text-fog">{m.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <AreaSelect userId={m.id} value={m.area} name={m.name} />
                      {m.area && (
                        <p className="mt-1 text-xs text-fog">
                          {m.areaDone}/{AREAS[m.area].lessons.length} {t("lecciones clave", "key lessons")}
                        </p>
                      )}
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
                    <td className="px-3 py-3 text-fog">{m.inboxAvg !== null ? `${m.inboxAvg}/100 · ${m.inboxCount}` : "—"}</td>
                    <td className="px-3 py-3 text-fog">{m.weakest ?? "—"}</td>
                    <td className="px-3 py-3">
                      {m.simsSent ? (
                        <span className={m.simsClicked ? "text-bad-text" : "text-ok"}>
                          {m.simsClicked
                            ? t(`Cayó ${m.simsClicked} de ${m.simsSent}`, `Fell for ${m.simsClicked} of ${m.simsSent}`)
                            : t(`0 de ${m.simsSent}`, `0 of ${m.simsSent}`)}
                          {m.simsReported > 0 && (
                            <span className="block text-xs text-ok">{t(`Reportó ${m.simsReported}`, `Reported ${m.simsReported}`)}</span>
                          )}
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
          <h2 className="font-display text-xl">{t("Simulacros de phishing", "Phishing drills")}</h2>
        </div>
        <p className="mb-5 mt-1 max-w-2xl text-sm text-fog">
          {t(
            `Enviamos a tus empleados un correo que imita una estafa. Si hacen clic, llegan a una página que les explica qué debieron notar. Solo lo reciben quienes se unieron a tu equipo y lo autorizaron. Máximo ${BUSINESS.campaignsPerDay} por día.`,
            `We send your employees an email that imitates a scam. If they click, they land on a page explaining what they should have noticed. Only people who joined your team and agreed to it receive them. Up to ${BUSINESS.campaignsPerDay} a day.`,
          )}
        </p>
        <SimLauncher templates={templates} members={members} />

        {report.campaigns.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-desk-line text-xs text-fog">
                <tr>
                  <th className="py-2 pr-3 font-medium">{t("Fecha", "Date")}</th>
                  <th className="px-3 py-2 font-medium">{t("Plantilla", "Template")}</th>
                  <th className="px-3 py-2 font-medium">{t("Enviados", "Sent")}</th>
                  <th className="px-3 py-2 font-medium">{t("Hicieron clic", "Clicked")}</th>
                  <th className="px-3 py-2 font-medium">{t("Lo reportaron", "Reported")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-desk-line">
                {report.campaigns.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 pr-3 text-fog">{fmt(c.createdAt)}</td>
                    <td className="px-3 py-2.5">{phishTemplate(c.templateId, lang)?.title ?? c.templateId}</td>
                    <td className="px-3 py-2.5 tabular-nums">{c.sent}</td>
                    <td className={`px-3 py-2.5 tabular-nums ${c.clicked ? "text-bad-text" : "text-ok"}`}>
                      {c.clicked} ({pct(c.clicked, c.sent)}%)
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-ok">
                      {c.reported} ({pct(c.reported, c.sent)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-[#f97316]" strokeWidth={1.75} aria-hidden />
          <h2 className="font-display text-xl">{t("Correos reportados por tu equipo", "Emails reported by your team")}</h2>
        </div>
        <p className="mt-1 text-sm text-fog">
          {t(
            "Lo que tus empleados marcaron como sospechoso y no era un simulacro. Revísalos: pueden ser ataques reales.",
            "What your employees flagged as suspicious that wasn't a drill. Check them: they may be real attacks.",
          )}
        </p>
        {report.reports.length === 0 ? (
          <p className="mt-5 text-sm text-fog">{t("Nadie ha reportado correos todavía.", "Nobody has reported any emails yet.")}</p>
        ) : (
          <ul className="mt-5 divide-y divide-desk-line rounded-2xl border border-desk-line">
            {report.reports.map((r) => (
              <li key={r.id} className="p-4 text-sm">
                <p className="font-semibold">{r.subject}</p>
                <p className="mt-0.5 text-fog">
                  {r.by} · {fmt(r.createdAt)}
                  {r.sender && (
                    <>
                      {" · "}
                      <span className="font-mono text-xs">{defang(r.sender)}</span>
                    </>
                  )}
                </p>
                {r.notes && <p className="mt-1 text-graphite">{r.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card id="comprar">
          <h2 className="font-display text-xl">{t("Agregar puestos", "Add seats")}</h2>
          <p className="mb-5 mt-1 text-sm text-fog">
            {t(`Pagas solo los días que faltan hasta el ${fmt(org.paidUntil!)}.`, `You only pay for the days left until ${fmt(org.paidUntil!)}.`)}
          </p>
          <AddSeats paidUntil={org.paidUntil!.toISOString()} current={org.seats} />
        </Card>
        <Card>
          <h2 className="font-display text-xl">{t("Renovar", "Renew")}</h2>
          <p className="mb-5 mt-1 text-sm text-fog">
            {t("Suma un año al vencimiento actual. No hay cobros automáticos.", "Adds a year to the current expiry date. No automatic charges.")}
          </p>
          <SeatCheckout mode="renovar" defaultSeats={org.seats} minSeats={Math.max(org.seats, org.memberCount)} />
        </Card>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ página

async function Empresa({ searchParams }: { searchParams: PageProps<"/[lang]/empresa">["searchParams"] }) {
  // El panel usa la base de datos y la fecha actual: siempre por petición.
  await connection();
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error.slice(0, 200) : undefined;
  const [user, { t }] = await Promise.all([getCurrentUser(), getT()]);
  // El plan familiar tiene su propia página
  if (user?.org?.kind === "familia") redirect(`/familia${sp.unido === "1" ? "?unido=1" : ""}`);
  if (user?.org?.role === "owner") return <OwnerView user={user} error={error} joined={sp.unido === "1"} />;
  if (user?.org) return <MemberView user={user} joined={sp.unido === "1"} />;
  return (
    <>
      {sp.salida === "1" && (
        <div className="mx-auto mb-6 max-w-[1100px]">
          <Notice tone="ok">{t("Saliste de la empresa.", "You left the company.")}</Notice>
        </div>
      )}
      <Pitch user={user} error={error} />
    </>
  );
}

export default function EmpresaPage(props: PageProps<"/[lang]/empresa">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-[70vh] max-w-[1100px] animate-pulse rounded-3xl bg-desk-3" />}>
        <Empresa searchParams={props.searchParams} />
      </Suspense>
    </PageShell>
  );
}
