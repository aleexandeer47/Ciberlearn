import { Award, Crosshair, Flame, Inbox, Layers, Lock, Swords, Timer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type CSSProperties } from "react";
import { logout } from "@/app/actions/auth";
import { HistoryChart } from "@/components/progress/HistoryChart";
import { PasswordNotice } from "@/components/progress/PasswordNotice";
import { PendingRunSaver } from "@/components/progress/PendingRunSaver";
import { PageShell } from "@/components/SiteHeader";
import { ShareAchievement } from "@/components/share/ShareAchievement";
import { currentStreak } from "@/lib/daily";
import { dayKey } from "@/lib/dayKey";
import { CATEGORY_LABELS } from "@/lib/scenarios/categories";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { computeStats } from "@/lib/stats";

export const metadata: Metadata = { title: "Mi progreso", robots: { index: false } };

const FREE_HISTORY = 3;
const MODE_LABEL: Record<string, string> = {
  clasico: "Clásico",
  pro: "Pack avanzado",
  contrarreloj: "Contrarreloj",
  entrenamiento: "Entrenamiento",
};

const fmtDate = (d: Date) => d.toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" });

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-desk-line bg-desk-2 p-5 sm:p-7 ${className}`}>{children}</section>;
}

function ProLock({ title, text }: { title: string; text: string }) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center rounded-3xl bg-desk-2/70 p-6 text-center backdrop-blur-[3px]">
      <div>
        <span className="rounded-full bg-brand px-2.5 py-1 font-mono text-[10px] font-semibold text-white">Pro</span>
        <p className="mt-3 font-semibold text-lg">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-fog">{text}</p>
        <Link href="/planes" className="btn btn-primary mt-4 px-5 py-2.5 text-sm">
          Ver planes
        </Link>
      </div>
    </div>
  );
}

async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/progreso");

  const { runs, users, dailyAnswers } = await collections();
  const today = dayKey();
  const [docs, profile, answeredToday] = await Promise.all([
    runs.find({ userId: user._id }).sort({ createdAt: -1 }).limit(300).toArray(),
    users.findOne({ _id: user._id }, { projection: { daily: 1, shareId: 1 } }),
    dailyAnswers.countDocuments({ userId: user._id, day: today }, { limit: 1 }),
  ]);
  const streak = currentStreak(profile?.daily, today);
  const stats = computeStats(docs);
  const recent = docs.slice(0, user.isPro ? 10 : FREE_HISTORY);
  const sortedSkills = [...stats.skills].sort((a, b) => b.pct - a.pct || b.total - a.total);
  const certReady = stats.runs >= 1 && stats.bestScore >= 70;

  const modes = [
    { href: "/simulador", title: "Clásico", desc: "Los 10 mensajes de siempre", pro: false, icon: Inbox },
    { href: "/simulador/pro", title: "Pack avanzado", desc: "6 mensajes difíciles nuevos", pro: true, icon: Layers },
    { href: "/simulador/contrarreloj", title: "Contrarreloj", desc: "40 segundos por mensaje", pro: true, icon: Timer },
    {
      href: "/simulador/entrenamiento",
      title: "Entrenamiento",
      desc: stats.weakest ? `Enfocado en: ${stats.weakest.label}` : "Practica tu punto débil",
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
          <p className="eyebrow">Tu expediente</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Hola, {user.name.split(" ")[0]}</h1>
        </div>
        {user.isPro ? (
          <p className="rounded-full bg-brand/15 px-4 py-2 text-sm text-brand">
            Pro hasta el {fmtDate(user.proEnds!)}
            {user.org?.active && ` · ${user.org.name}`}
          </p>
        ) : (
          <Link href="/planes" className="btn btn-ghost px-4 py-2 text-sm">
            Plan gratis · Mejorar a Pro
          </Link>
        )}
      </div>

      {/* Hábito y compartir */}
      <div className="grid gap-5 md:grid-cols-3">
        <Link href="/diaria" className="group rounded-3xl border border-desk-line bg-desk-2 p-5 transition-colors hover:border-brand">
          <p className="flex items-center gap-2 text-sm text-fog">
            <Flame className="h-4 w-4 text-[#f97316]" aria-hidden /> Estafa del día
          </p>
          <p className="mt-2 font-display text-2xl">
            {streak > 0 ? `${streak} ${streak === 1 ? "día" : "días"} de racha` : "Empieza tu racha"}
          </p>
          <p className="mt-1 text-sm text-fog">{answeredToday ? "Ya respondiste hoy. Vuelve mañana." : "Un caso nuevo hoy · 30 segundos →"}</p>
        </Link>
        <Link href="/reto" className="group rounded-3xl border border-desk-line bg-desk-2 p-5 transition-colors hover:border-brand">
          <p className="flex items-center gap-2 text-sm text-fog">
            <Swords className="h-4 w-4 text-brand" aria-hidden /> Reto entre amigos
          </p>
          <p className="mt-2 font-display text-2xl">Reta a alguien</p>
          <p className="mt-1 text-sm text-fog">5 mensajes por WhatsApp: ¿quién detecta más? →</p>
        </Link>
        <Card>
          <p className="text-sm text-fog">Tu tarjeta de logro</p>
          <p className="mb-3 mt-2 font-display text-2xl">Presume tu nivel</p>
          <ShareAchievement initialPath={profile?.shareId ? `/logro/${profile.shareId}` : null} />
        </Card>
      </div>

      {stats.runs === 0 ? (
        <Card className="py-14 text-center">
          <p className="font-display text-2xl font-semibold">Tu expediente está vacío</p>
          <p className="mx-auto mt-2 max-w-md text-fog">Haz tu primera ronda para ver tu nivel, tus skills y tus insignias.</p>
          <Link href="/simulador" className="btn btn-primary mt-6 px-7 py-3.5">
            Empezar mi primera ronda →
          </Link>
        </Card>
      ) : (
        <>
          {/* Nivel + cifras */}
          <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-fog">Nivel {stats.level.index}</p>
                  <p className="font-display text-3xl font-semibold">{stats.level.name}</p>
                </div>
                <p className="text-right">
                  <span className="font-display text-3xl font-semibold tabular-nums">{stats.xp.toLocaleString("es-SV")}</span>
                  <span className="block text-xs text-fog">XP total</span>
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
                  ? `${stats.level.toNext.toLocaleString("es-SV")} XP para ${stats.level.nextName}`
                  : "Nivel máximo alcanzado"}
              </p>
            </Card>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              {[
                { v: stats.streak, l: stats.streak === 1 ? "día seguido" : "días seguidos", accent: stats.streak > 0 },
                { v: `${stats.accuracy}%`, l: "veredictos acertados" },
                { v: stats.bestScore, l: "mejor ronda" },
                { v: stats.messages, l: "mensajes revisados" },
              ].map((t) => (
                <div key={t.l} className="rounded-2xl border border-desk-line bg-desk-2 p-4">
                  <p className="flex items-center gap-1.5 font-display text-3xl tabular-nums">
                    {t.accent && <Flame className="h-5 w-5 text-brand" strokeWidth={1.75} aria-hidden />}
                    {t.v}
                  </p>
                  <p className="mt-1 text-xs text-fog">{t.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <Card>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">Skills</h2>
                <p className="mt-1 text-sm text-fog">Qué porcentaje de cada tipo de señal detectas.</p>
              </div>
              {stats.weakest && (
                <Link
                  href={user.isPro ? "/simulador/entrenamiento" : "/planes"}
                  className="btn btn-ghost px-4 py-2 text-sm"
                >
                  <Crosshair className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  Entrenar “{stats.weakest.label}” {!user.isPro && <span className="text-fog">· Pro</span>}
                </Link>
              )}
            </div>
            <ul className="mt-6 grid gap-x-10 gap-y-4 md:grid-cols-2">
              {sortedSkills.map((s, i) => (
                <li key={s.category}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold">
                      {s.label}
                      {stats.weakest?.category === s.category && (
                        <span className="ml-2 rounded-full bg-bad/15 px-2 py-0.5 text-[10px] font-normal text-bad-text">
                          punto débil
                        </span>
                      )}
                    </span>
                    <span className="tabular-nums text-fog">{s.total ? `${s.pct}% · ${s.found}/${s.total}` : "sin datos"}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-desk">
                    {s.total > 0 && (
                      <div
                        className="bar-fill h-full rounded-full bg-hl"
                        style={{ width: `${Math.max(s.pct, 2)}%`, "--i": i } as CSSProperties}
                      />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-fog/80">{CATEGORY_LABELS[s.category].hint}</p>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {/* Modos */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card className="relative">
            <h2 className="font-display text-xl font-semibold">Evolución</h2>
            <p className="mb-4 mt-1 text-sm text-fog">Puntaje de cada ronda, de la más antigua a la más reciente.</p>
            {user.isPro ? (
              <HistoryChart points={stats.history.slice(-30)} />
            ) : (
              <>
                <div className="h-[220px] rounded-xl bg-[linear-gradient(transparent_49%,var(--desk-line)_50%,transparent_51%)]" />
                <ProLock title="Tu evolución completa" text="Mira cómo mejoras ronda a ronda y en qué modo rindes mejor." />
              </>
            )}
          </Card>
          <Card>
            <h2 className="font-display text-xl font-semibold">Últimas rondas</h2>
            <ul className="mt-4 divide-y divide-desk-line">
              {recent.map((r) => (
                <li key={r._id.toHexString()} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{MODE_LABEL[r.mode] ?? r.mode}</p>
                    <p className="text-xs text-fog">
                      {r.createdAt.toLocaleDateString("es-SV", { day: "numeric", month: "short" })} ·{" "}
                      {r.answers.filter((a) => a.verdictCorrect).length}/{r.answers.length} veredictos
                    </p>
                  </div>
                  <span className="font-semibold text-lg tabular-nums">{r.score}</span>
                </li>
              ))}
            </ul>
            {!user.isPro && stats.runs > FREE_HISTORY && (
              <p className="mt-3 text-xs text-fog">
                Ves las últimas {FREE_HISTORY}.{" "}
                <Link href="/planes" className="text-chalk underline">
                  Con Pro ves todas
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
          Insignias <span className="text-base font-normal text-fog">· {stats.achievements.filter((a) => a.earned).length}/{stats.achievements.length}</span>
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
      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <Card className="relative">
          <h2 className="font-display text-xl font-semibold">Certificado de finalización</h2>
          <p className="mt-1 text-sm text-fog">
            {certReady
              ? "Ya puedes descargar tu certificado interno con tu nivel y tu mejor puntaje."
              : "Se desbloquea al completar una ronda con 70 puntos o más."}
          </p>
          {user.isPro ? (
            certReady && (
              <Link href="/certificado" className="btn btn-primary mt-5 px-5 py-2.5 text-sm">
                Ver mi certificado
              </Link>
            )
          ) : (
            <ProLock title="Certificado" text="Demuestra que completaste el entrenamiento." />
          )}
        </Card>
        <Card>
          <h2 className="font-display text-xl font-semibold">Cuenta</h2>
          <p className="mt-1 truncate text-sm text-fog">{user.email}</p>
          <form action={logout} className="mt-5">
            <button type="submit" className="btn btn-ghost px-5 py-2.5 text-sm">
              Cerrar sesión
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
