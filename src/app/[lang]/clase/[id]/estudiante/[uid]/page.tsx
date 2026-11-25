import { ArrowLeft, Award, BookOpen, Flame, Lock, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SkillRadar } from "@/components/progress/SkillRadar";
import { PageShell } from "@/components/SiteHeader";
import { currentStreak } from "@/lib/daily";
import { dayKey } from "@/lib/dayKey";
import { LOCALE } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { LESSONS } from "@/lib/path/content";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { computeStats } from "@/lib/stats";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Perfil del estudiante", "Student profile"), robots: { index: false, follow: false } };
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-3xl border border-desk-line bg-desk-2 p-5 sm:p-7 ${className}`}>{children}</section>;
}

/**
 * Perfil de un estudiante para su docente. Solo se muestra si:
 *  - quien mira es el docente de esa clase,
 *  - el estudiante está en la clase y autorizó ver su perfil completo (profileConsent).
 */
async function Profile({ params }: { params: Promise<{ id: string; uid: string }> }) {
  await connection();
  const { id, uid } = await params;
  const { lang, t } = await getT();
  const loc = LOCALE[lang];
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/clase");
  if (!ObjectId.isValid(id) || !ObjectId.isValid(uid)) notFound();

  const { classes, classMembers, users, runs } = await collections();
  const cls = await classes.findOne({ _id: new ObjectId(id), teacherId: user._id }, { projection: { name: 1 } });
  if (!cls) notFound();
  const member = await classMembers.findOne({ classId: cls._id, userId: new ObjectId(uid) });
  if (!member) notFound();

  const back = (
    <Link href={`/clase/${id}`} className="inline-flex items-center gap-1.5 text-sm text-fog hover:text-chalk">
      <ArrowLeft className="h-4 w-4" aria-hidden /> {cls.name}
    </Link>
  );

  const student = await users.findOne({ _id: member.userId }, { projection: { name: 1, xp: 1, path: 1, daily: 1, lastLoginAt: 1 } });
  if (!student) notFound();

  if (!member.profileConsent) {
    return (
      <div className="space-y-6">
        {back}
        <Card className="text-center">
          <Lock className="mx-auto h-8 w-8 text-fog" aria-hidden />
          <h1 className="mt-3 font-display text-2xl">{student.name}</h1>
          <p className="mx-auto mt-2 max-w-md text-fog">
            {t(
              "Este estudiante se unió antes de que existiera el perfil completo y todavía no autorizó que lo veas. Le aparece un aviso en la página de clases para hacerlo.",
              "This student joined before the full profile existed and hasn't authorized you to see it yet. They see a notice on the classes page to do it.",
            )}
          </p>
        </Card>
      </div>
    );
  }

  const docs = await runs.find({ userId: member.userId }).sort({ createdAt: -1 }).limit(300).toArray();
  const stats = computeStats(docs, lang);
  const lessonsDone = student.path?.completed?.length ?? 0;
  const streak = currentStreak(student.daily, dayKey());
  const MODE_LABEL: Record<string, string> = {
    clasico: t("Clásico", "Classic"),
    pro: t("Pack avanzado", "Advanced pack"),
    contrarreloj: t("Contrarreloj", "Time trial"),
    entrenamiento: t("Entrenamiento", "Training"),
  };

  return (
    <div className="space-y-5">
      {back}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t("Perfil del estudiante", "Student profile")}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{student.name}</h1>
          <p className="mt-1 text-sm text-fog">
            {t("Última vez", "Last seen")}:{" "}
            {student.lastLoginAt ? student.lastLoginAt.toLocaleDateString(loc, { day: "numeric", month: "long" }) : "—"}
          </p>
        </div>
        <p className="flex items-center gap-1.5 rounded-full bg-ok/15 px-3 py-1.5 text-xs text-ok">
          <ShieldCheck className="h-4 w-4" aria-hidden /> {t("Autorizó que veas su perfil", "Authorized you to see their profile")}
        </p>
      </div>

      {/* Nivel y cifras */}
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
              <span className="block text-xs text-fog">{t("XP del simulador", "Simulator XP")}</span>
            </p>
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-desk">
            <div className="h-full rounded-full bg-hl" style={{ width: `${Math.max(3, stats.level.progress * 100)}%` }} />
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {[
            { v: `${lessonsDone}/${LESSONS.length}`, l: t("lecciones de la ruta", "path lessons"), icon: BookOpen },
            { v: (student.xp ?? 0).toLocaleString(loc), l: t("XP total (ranking)", "total XP (leaderboard)"), icon: Award },
            { v: streak, l: t("días de racha en la estafa del día", "day streak on the scam of the day"), icon: Flame },
            { v: stats.runs ? `${stats.accuracy}%` : "—", l: t("veredictos acertados", "correct verdicts"), icon: ShieldCheck },
          ].map((x) => (
            <div key={x.l} className="rounded-2xl border border-desk-line bg-desk-2 p-4">
              <p className="flex items-center gap-1.5 font-display text-2xl tabular-nums sm:text-3xl">
                <x.icon className="h-5 w-5 text-brand" strokeWidth={1.75} aria-hidden /> {x.v}
              </p>
              <p className="mt-1 text-xs text-fog">{x.l}</p>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <h2 className="font-display text-xl font-semibold">{t("Habilidades", "Skills")}</h2>
        <p className="mt-1 text-sm text-fog">
          {stats.runs
            ? t("Qué porcentaje de cada tipo de señal detecta en el simulador.", "What share of each kind of sign they spot in the simulator.")
            : t("Todavía no juega ninguna ronda del simulador.", "They haven't played a simulator round yet.")}
        </p>
        {stats.runs > 0 && (
          <div className="mt-4">
            <SkillRadar
              skills={stats.skills}
              weakest={stats.weakest?.category ?? null}
              noData={t("sin datos", "no data")}
              ariaLabel={t(
                `Habilidades de ${student.name}: ${stats.skills.map((s) => `${s.label} ${s.total ? `${s.pct}%` : "sin datos"}`).join(", ")}`,
                `${student.name}'s skills: ${stats.skills.map((s) => `${s.label} ${s.total ? `${s.pct}%` : "no data"}`).join(", ")}`,
              )}
            />
            {stats.weakest && (
              <p className="mt-2 text-center text-sm text-fog">
                {t("Punto débil", "Weak spot")}: <strong className="text-bad-text">{stats.weakest.label}</strong>
              </p>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <h2 className="font-display text-xl font-semibold">{t("Últimas rondas", "Latest rounds")}</h2>
          {docs.length === 0 ? (
            <p className="mt-3 text-sm text-fog">—</p>
          ) : (
            <ul className="mt-4 divide-y divide-desk-line">
              {docs.slice(0, 10).map((r) => (
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
          )}
        </Card>
        <Card>
          <h2 className="font-display text-xl font-semibold">
            {t("Insignias", "Badges")}{" "}
            <span className="text-base font-normal text-fog">
              · {stats.achievements.filter((a) => a.earned).length}/{stats.achievements.length}
            </span>
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stats.achievements.map((a) => (
              <li
                key={a.id}
                className={`rounded-2xl p-3 text-center ${a.earned ? "bg-paper text-ink ring-1 ring-line" : "border border-dashed border-desk-line text-fog/60"}`}
              >
                {a.earned ? <Award className="mx-auto h-5 w-5 text-brand-dark" aria-hidden /> : <Lock className="mx-auto h-4 w-4" aria-hidden />}
                <p className="mt-2 text-xs font-semibold">{a.title}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default function EstudiantePage(props: PageProps<"/[lang]/clase/[id]/estudiante/[uid]">) {
  return (
    <PageShell>
      <div className="mx-auto max-w-[1000px]">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-desk-3" />}>
          <Profile params={props.params} />
        </Suspense>
      </div>
    </PageShell>
  );
}
