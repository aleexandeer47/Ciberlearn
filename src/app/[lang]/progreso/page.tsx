import { Award, Crosshair, Flame, Inbox, Layers, Lock, Mail, Swords, Timer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { HistoryChart } from "@/components/progress/HistoryChart";
import { PasswordNotice } from "@/components/progress/PasswordNotice";
import { PendingRunSaver } from "@/components/progress/PendingRunSaver";
import { SkillRadar } from "@/components/progress/SkillRadar";
import { PageShell } from "@/components/SiteHeader";
import { ShareAchievement } from "@/components/share/ShareAchievement";
import { currentStreak } from "@/lib/daily";
import { dayKey } from "@/lib/dayKey";
import { LOCALE } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { categoryLabels } from "@/lib/scenarios/categories";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { computeStats } from "@/lib/stats";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Mi progreso", "My progress"), robots: { index: false } };
}

const FREE_HISTORY = 3;

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  // min-w-0: dentro de una cuadrícula, nada de su contenido (como un gráfico) puede ensanchar la página
  return <section className={`min-w-0 rounded-3xl border border-desk-line bg-desk-2 p-5 sm:p-7 ${className}`}>{children}</section>;
}

async function ProLock({ title, text }: { title: string; text: string }) {
  const { t } = await getT();
  return (
    <div className="absolute inset-0 z-10 grid place-items-center rounded-3xl bg-desk-2/70 p-6 text-center backdrop-blur-[3px]">
      <div>
        <span className="rounded-full bg-brand px-2.5 py-1 font-mono text-[10px] font-semibold text-white">Pro</span>
        <p className="mt-3 font-semibold text-lg">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-fog">{text}</p>
        <Link href="/planes" className="btn btn-primary mt-4 px-5 py-2.5 text-sm">
          {t("Ver planes", "See plans")}
        </Link>
      </div>
    </div>
  );
}

async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/progreso");
  const { lang, t } = await getT();
  const loc = LOCALE[lang];
  const fmtDate = (d: Date) => d.toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric" });
  const MODE_LABEL: Record<string, string> = {
    clasico: t("Clásico", "Classic"),
    pro: t("Pack avanzado", "Advanced pack"),
    contrarreloj: t("Contrarreloj", "Time trial"),
    entrenamiento: t("Entrenamiento", "Training"),
  };

  const { runs, users, dailyAnswers } = await collections();
  const today = dayKey();
  const [docs, profile, answeredToday] = await Promise.all([
    runs.find({ userId: user._id }).sort({ createdAt: -1 }).limit(300).toArray(),
    users.findOne({ _id: user._id }, { projection: { daily: 1, shareId: 1 } }),
    dailyAnswers.countDocuments({ userId: user._id, day: today }, { limit: 1 }),
  ]);
  const streak = currentStreak(profile?.daily, today);
  const stats = computeStats(docs, lang);
  const recent = docs.slice(0, user.isPro ? 10 : FREE_HISTORY);
  const sortedSkills = [...stats.skills].sort((a, b) => b.pct - a.pct || b.total - a.total);
  const certReady = stats.runs >= 1 && stats.bestScore >= 70;
  const L = categoryLabels(lang);

  const modes = [
    { href: "/simulador", title: t("Clásico", "Classic"), desc: t("Los 10 mensajes de siempre", "The usual 10 messages"), pro: false, icon: Inbox },
    { href: "/bandeja", title: t("Bandeja", "Inbox"), desc: t("Un día de correo simulado", "A simulated day of email"), pro: true, icon: Mail },
    {
      href: "/simulador/pro",
      title: t("Pack avanzado", "Advanced pack"),
      desc: t("6 mensajes difíciles nuevos", "6 new hard messages"),
      pro: true,
      icon: Layers,
    },
    {
      href: "/simulador/contrarreloj",
      title: t("Contrarreloj", "Time trial"),
      desc: t("40 segundos por mensaje", "40 seconds per message"),
      pro: true,
      icon: Timer,
    },
    {
      href: "/simulador/entrenamiento",
      title: t("Entrenamiento", "Training"),
      desc: stats.weakest
        ? t(`Enfocado en: ${stats.weakest.label}`, `Focused on: ${stats.weakest.label}`)
        : t("Practica tu punto débil", "Practice your weak spot"),
      pro: true,
      icon: Crosshair,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PendingRunSaver />
      <Suspense>
        <PasswordNotice />
      </Suspense>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t("Tu expediente", "Your record")}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            {t("Hola", "Hi")}, {user.name.split(" ")[0]}
          </h1>
        </div>
        {user.isPro ? (
          <p className="rounded-full bg-brand/15 px-4 py-2 text-sm text-brand">
            {t("Pro hasta el", "Pro until")} {fmtDate(user.proEnds!)}
            {user.org?.active && ` · ${user.org.name}`}
          </p>
        ) : (
          <Link href="/planes" className="btn btn-ghost px-4 py-2 text-sm">
            {t("Plan gratis · Mejorar a Pro", "Free plan · Upgrade to Pro")}
          </Link>
        )}
      </div>

      {/* Hábito y compartir */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Link href="/diaria" className="group rounded-3xl border border-desk-line bg-desk-2 p-5 transition-colors hover:border-brand">
          <p className="flex items-center gap-2 text-sm text-fog">
            <Flame className="h-4 w-4 text-[#f97316]" aria-hidden /> {t("Estafa del día", "Scam of the day")}
          </p>
          <p className="mt-2 font-display text-2xl">
            {streak > 0
              ? t(`${streak} ${streak === 1 ? "día" : "días"} de racha`, `${streak}-day streak`)
              : t("Empieza tu racha", "Start your streak")}
          </p>
          <p className="mt-1 text-sm text-fog">
            {answeredToday
              ? t("Ya respondiste hoy. Vuelve mañana.", "You already answered today. Come back tomorrow.")
              : t("Un caso nuevo hoy · 30 segundos →", "A new case today · 30 seconds →")}
          </p>
        </Link>
        <Link href="/reto" className="group rounded-3xl border border-desk-line bg-desk-2 p-5 transition-colors hover:border-brand">
          <p className="flex items-center gap-2 text-sm text-fog">
            <Swords className="h-4 w-4 text-brand" aria-hidden /> {t("Reto entre amigos", "Challenge with friends")}
          </p>
          <p className="mt-2 font-display text-2xl">{t("Reta a alguien", "Challenge someone")}</p>
          <p className="mt-1 text-sm text-fog">{t("5 mensajes por WhatsApp: ¿quién detecta más? →", "5 messages over WhatsApp: who spots more? →")}</p>
        </Link>
        <Card>
          <p className="text-sm text-fog">{t("Tu tarjeta de logro", "Your achievement card")}</p>
          <p className="mb-3 mt-2 font-display text-2xl">{t("Presume tu nivel", "Show off your level")}</p>
          <ShareAchievement initialPath={profile?.shareId ? `/logro/${profile.shareId}` : null} />
        </Card>
      </div>

      {stats.runs === 0 ? (
        <Card className="py-14 text-center">
          <p className="font-display text-2xl font-semibold">{t("Tu expediente está vacío", "Your record is empty")}</p>
          <p className="mx-auto mt-2 max-w-md text-fog">
            {t(
              "Haz tu primera ronda para ver tu nivel, tus skills y tus insignias.",
              "Play your first round to see your level, skills and badges.",
            )}
          </p>
          <Link href="/simulador" className="btn btn-primary mt-6 px-7 py-3.5">
            {t("Empezar mi primera ronda →", "Start my first round →")}
          </Link>
        </Card>
      ) : (
        <>
          {/* Nivel + cifras */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-fog">
                    {t("Nivel", "Level")} {stats.level.index}
                  </p>
                  <p className="font-display text-3xl font-semibold">{stats.level.name}</p>
                </div>
                <p className="text-right">
                  <span className="font-display text-3xl font-semibold tabular-nums">{stats.xp.toLocaleString(loc)}</span>
                  <span className="block text-xs text-fog">{t("XP total", "Total XP")}</span>
                </p>
              </div>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-desk">
                <div
                  className="bar-fill h-full rounded-full bg-hl"
                  style={{ width: `${Math.max(3, stats.level.progress * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-fog">
                {stats.level.nextName
                  ? t(
                      `${stats.level.toNext.toLocaleString(loc)} XP para ${stats.level.nextName}`,
                      `${stats.level.toNext.toLocaleString(loc)} XP to ${stats.level.nextName}`,
                    )
                  : t("Nivel máximo alcanzado", "Top level reached")}
              </p>
            </Card>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              {[
                {
                  v: stats.streak,
                  l: stats.streak === 1 ? t("día seguido", "day in a row") : t("días seguidos", "days in a row"),
                  accent: stats.streak > 0,
                },
                { v: `${stats.accuracy}%`, l: t("veredictos acertados", "correct verdicts") },
                { v: stats.bestScore, l: t("mejor ronda", "best round") },
                { v: stats.messages, l: t("mensajes revisados", "messages reviewed") },
              ].map((x) => (
                <div key={x.l} className="rounded-2xl border border-desk-line bg-desk-2 p-4">
                  <p className="flex items-center gap-1.5 font-display text-3xl tabular-nums">
                    {x.accent && <Flame className="h-5 w-5 text-brand" strokeWidth={1.75} aria-hidden />}
                    {x.v}
                  </p>
                  <p className="mt-1 text-xs text-fog">{x.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <Card>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">Skills</h2>
                <p className="mt-1 text-sm text-fog">
                  {t("Qué porcentaje de cada tipo de señal detectas.", "What share of each kind of sign you spot.")}
                </p>
              </div>
              {stats.weakest && (
                <Link
                  href={user.isPro ? "/simulador/entrenamiento" : "/planes"}
                  className="btn btn-ghost px-4 py-2 text-sm"
                >
                  <Crosshair className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  {t("Entrenar", "Train")} “{stats.weakest.label}” {!user.isPro && <span className="text-fog">· Pro</span>}
                </Link>
              )}
            </div>
            <div className="mt-4">
              <SkillRadar
                skills={stats.skills}
                weakest={stats.weakest?.category ?? null}
                noData={t("sin datos", "no data")}
                ariaLabel={t(
                  `Radar de habilidades: ${stats.skills.map((s) => `${s.label} ${s.total ? `${s.pct}%` : "sin datos"}`).join(", ")}`,
                  `Skills radar: ${stats.skills.map((s) => `${s.label} ${s.total ? `${s.pct}%` : "no data"}`).join(", ")}`,
                )}
              />
            </div>
            {/* Detalle: de la más fuerte a la más débil, con lo que significa cada una */}
            <details className="group mt-2 rounded-2xl border border-desk-line">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-chalk marker:hidden">
                {t("Ver detalle por tipo de señal", "See detail by type of sign")} <span className="text-fog group-open:hidden">▾</span>
                <span className="hidden text-fog group-open:inline">▴</span>
              </summary>
              <ul className="grid gap-x-8 gap-y-3 border-t border-desk-line px-4 py-4 sm:grid-cols-2">
                {sortedSkills.map((s) => (
                  <li key={s.category} className="min-w-0">
                    <p className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-semibold">
                        {s.label}
                        {stats.weakest?.category === s.category && (
                          <span className="ml-2 rounded-full bg-bad/15 px-2 py-0.5 text-[10px] font-normal text-bad-text">
                            {t("punto débil", "weak spot")}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 tabular-nums text-fog">
                        {s.total ? `${s.pct}% · ${s.found}/${s.total}` : t("sin datos", "no data")}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-fog/80">{L[s.category].hint}</p>
                  </li>
                ))}
              </ul>
            </details>
          </Card>
        </>
      )}

      {/* Modos */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {modes.map((m) => {
          const locked = m.pro && !user.isPro;
          return (
            <Link
              key={m.href}
              href={locked ? "/planes" : m.href}
              className="group relative rounded-2xl border border-desk-line bg-desk-2 p-5 transition-[transform,border-color] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-fog/50 active:scale-[0.98]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-desk-3 text-accent" aria-hidden>
                <m.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </span>
              {m.pro && (
                <span
                  className={`absolute right-4 top-4 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                    locked ? "bg-desk-3 text-fog" : "bg-brand text-white"
                  }`}
                >
                  {locked && <Lock className="mr-1 inline h-3 w-3 -translate-y-px" strokeWidth={2} aria-hidden />}
                  Pro
                </span>
              )}
              <p className="mt-4 font-display font-semibold">{m.title}</p>
              <p className="mt-1 text-sm text-fog">{m.desc}</p>
            </Link>
          );
        })}
      </div>

      {stats.runs > 0 && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card className="relative">
            <h2 className="font-display text-xl font-semibold">{t("Evolución", "Progress over time")}</h2>
            <p className="mb-4 mt-1 text-sm text-fog">
              {t("Puntaje de cada ronda, de la más antigua a la más reciente.", "Score of each round, from oldest to newest.")}
            </p>
            {user.isPro ? (
              <HistoryChart points={stats.history.slice(-30)} />
            ) : (
              <>
                <div className="h-[220px] rounded-xl bg-[linear-gradient(transparent_49%,var(--desk-line)_50%,transparent_51%)]" />
                <ProLock
                  title={t("Tu evolución completa", "Your full progress")}
                  text={t(
                    "Mira cómo mejoras ronda a ronda y en qué modo rindes mejor.",
                    "See how you improve round by round and which mode suits you best.",
                  )}
                />
              </>
            )}
          </Card>
          <Card>
            <h2 className="font-display text-xl font-semibold">{t("Últimas rondas", "Latest rounds")}</h2>
            <ul className="mt-4 divide-y divide-desk-line">
              {recent.map((r) => (
                <li key={r._id.toHexString()} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{MODE_LABEL[r.mode] ?? r.mode}</p>
                    <p className="text-xs text-fog">
                      {r.createdAt.toLocaleDateString(loc, { day: "numeric", month: "short" })} ·{" "}
                      {r.answers.filter((a) => a.verdictCorrect).length}/{r.answers.length} {t("veredictos", "verdicts")}
                    </p>
                  </div>
                  <span className="font-semibold text-lg tabular-nums">{r.score}</span>
                </li>
              ))}
            </ul>
            {!user.isPro && stats.runs > FREE_HISTORY && (
              <p className="mt-3 text-xs text-fog">
                {t(`Ves las últimas ${FREE_HISTORY}.`, `You see the last ${FREE_HISTORY}.`)}{" "}
                <Link href="/planes" className="text-chalk underline">
                  {t("Con Pro ves todas", "See all with Pro")}
                </Link>
                .
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Insignias */}
      <Card>
        <h2 className="font-display text-xl font-semibold">
          {t("Insignias", "Badges")}{" "}
          <span className="text-base font-normal text-fog">
            · {stats.achievements.filter((a) => a.earned).length}/{stats.achievements.length}
          </span>
        </h2>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {stats.achievements.map((a) => (
            <li
              key={a.id}
              className={`rounded-2xl p-4 text-center ${a.earned ? "bg-paper text-ink ring-1 ring-line" : "border border-dashed border-desk-line text-fog/60"}`}
            >
              <span
                className={`mx-auto grid h-12 w-12 -rotate-6 place-items-center rounded-full border-[3px] border-double font-display text-lg font-bold ${
                  a.earned ? "border-brand-dark text-brand-dark" : "border-desk-line"
                }`}
              >
                {a.earned ? <Award className="h-5 w-5" strokeWidth={1.75} aria-hidden /> : <Lock className="h-4 w-4" strokeWidth={1.5} aria-hidden />}
              </span>
              <p className="mt-3 text-sm font-semibold">{a.title}</p>
              <p className={`mt-1 text-xs ${a.earned ? "text-ink-2" : ""}`}>{a.desc}</p>
            </li>
          ))}
        </ul>
      </Card>

      {/* Certificado + cuenta */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.4fr_1fr]">
        <Card className="relative">
          <h2 className="font-display text-xl font-semibold">{t("Certificado de finalización", "Certificate of completion")}</h2>
          <p className="mt-1 text-sm text-fog">
            {certReady
              ? t(
                  "Ya puedes descargar tu certificado interno con tu nivel y tu mejor puntaje.",
                  "You can now download your certificate with your level and best score.",
                )
              : t("Se desbloquea al completar una ronda con 70 puntos o más.", "Unlocks when you finish a round with 70 points or more.")}
          </p>
          {user.isPro ? (
            certReady && (
              <Link href="/certificado" className="btn btn-primary mt-5 px-5 py-2.5 text-sm">
                {t("Ver mi certificado", "See my certificate")}
              </Link>
            )
          ) : (
            <ProLock
              title={t("Certificado", "Certificate")}
              text={t("Demuestra que completaste el entrenamiento.", "Prove that you completed the training.")}
            />
          )}
        </Card>
        <Card>
          <h2 className="font-display text-xl font-semibold">{t("Cuenta", "Account")}</h2>
          <p className="mt-1 truncate text-sm text-fog">{user.email}</p>
          <form action={logout} className="mt-5">
            <button type="submit" className="btn btn-ghost px-5 py-2.5 text-sm">
              {t("Cerrar sesión", "Log out")}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function ProgresoPage() {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-[70vh] max-w-6xl animate-pulse rounded-3xl bg-desk-2/50" />}>
        <Dashboard />
      </Suspense>
    </PageShell>
  );
}
