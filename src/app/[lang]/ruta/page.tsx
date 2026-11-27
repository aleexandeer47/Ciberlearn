import { Anchor, CalendarDays, Check, Trophy, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { DiveMap, zoneOf, type DiveLesson } from "@/components/path/DiveMap";
import { DiveReplay } from "@/components/path/DiveReplay";
import { Hearts } from "@/components/path/Hearts";
import { ScrollToCurrent } from "@/components/path/ScrollToCurrent";
import { PageShell } from "@/components/SiteHeader";
import { view } from "@/lib/lives";
import { getT } from "@/lib/i18n-server";
import { isUnlocked, LESSON_ORDER, SECTION_2_START, unitsFor } from "@/lib/path/content";
import { collections } from "@/lib/server/db";
import { extraUnlocked, getCurrentUser } from "@/lib/server/session";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    alternates: await alternatesFor("/ruta"),
    title: t("Ruta guiada: cómo evitar estafas digitales", "Guided path: how to avoid online scams"),
    description: t(
      "Lecciones cortas y gratis para aprender a detectar phishing, identificar correos falsos y evitar estafas digitales y la suplantación de identidad.",
      "Short, free lessons to learn to spot phishing, identify fake emails and avoid online scams and impersonation.",
    ),
  };
}

async function PathMap() {
  // Las vidas dependen de la hora actual: siempre por petición.
  await connection();
  const { lang, t } = await getT();
  const UNITS = unitsFor(lang);
  const user = await getCurrentUser();
  let completed = new Set<string>();
  let lives = view(null, false);
  let xp = 0;
  if (user) {
    const { users } = await collections();
    const doc = await users.findOne({ _id: user._id }, { projection: { path: 1, lives: 1, xp: 1 } });
    completed = new Set(doc?.path?.completed ?? []);
    lives = view(doc?.lives, user.isPro);
    xp = doc?.xp ?? 0;
  }
  const current = LESSON_ORDER.find((id) => !completed.has(id) && isUnlocked(id, completed));
  const doneCount = completed.size;

  const areaOpen = extraUnlocked(user);
  const lessons = new Map<string, DiveLesson>();
  for (const unit of UNITS)
    for (const l of unit.lessons) {
      const state = completed.has(l.id) ? "done" : l.id === current ? "current" : areaOpen.has(l.id) ? "area" : "locked";
      const href = state === "locked" ? undefined : user ? `/ruta/${l.id}` : `/registro?next=/ruta/${l.id}`;
      lessons.set(l.id, { id: l.id, title: l.title, questions: l.exercises.length, state, href, ...(l.boss ? { boss: true } : {}) });
    }

  // Zona en la que va la persona
  const zoneIndex = Math.max(0, UNITS.findIndex((u) => u.lessons.some((l) => l.id === current)));
  const allDone = !current && doneCount > 0;
  const zone = zoneOf(allDone ? UNITS.length - 1 : zoneIndex, lang);

  return (
    <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[1fr_300px]">
      <ScrollToCurrent enabled={doneCount > 0} />
      <div>
        <span className="eyebrow">{t("Ruta guiada", "Guided path")}</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{t("Inmersión: aprende a ver el anzuelo", "Deep dive: learn to see the hook")}</h1>
        <p className="mb-8 mt-3 max-w-xl text-lg text-fog">
          {t(
            "Phishing viene de “pescar”. Baja zona por zona: mientras más hondo, más difíciles los anzuelos. Cada error cuesta una vida y las vidas vuelven solas con el tiempo.",
            "Phishing comes from “fishing”. Go down zone by zone: the deeper you go, the harder the hooks. Every mistake costs a life, and lives come back on their own over time.",
          )}
        </p>
        <DiveMap units={UNITS} lessons={lessons} loggedIn={!!user} lang={lang} section2Start={SECTION_2_START} />
      </div>

      {/* Panel lateral */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl bg-[linear-gradient(160deg,#0c6e9e,#06243b)] p-5 text-white">
          <p className="flex items-center gap-2 text-sm text-white/75">
            <Anchor className="h-4 w-4" aria-hidden /> {allDone ? t("Llegaste al fondo", "You reached the bottom") : t("Profundidad actual", "Current depth")}
          </p>
          <p className="mt-1 font-display text-3xl">{zone.depth}</p>
          <p className="text-sm text-[#7dd3fc]">{zone.name}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-[#5eead4]" style={{ width: `${Math.round((doneCount / LESSON_ORDER.length) * 100)}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-white/70">
            {t(`${doneCount} de ${LESSON_ORDER.length} lecciones`, `${doneCount} of ${LESSON_ORDER.length} lessons`)}
          </p>
          <DiveReplay
            zone={allDone ? UNITS.length - 1 : zoneIndex}
            progress={{
              zones: UNITS.map((u) =>
                u.lessons.map((l) => {
                  const s = lessons.get(l.id)!.state;
                  return { state: s === "done" ? "done" : s === "current" ? "current" : "locked", ...(l.boss ? { boss: true } : {}) };
                }),
              ),
            }}
          />
        </div>
        {user ? (
          <>
            <div className="rounded-3xl border border-desk-line bg-desk-2 p-5">
              <p className="text-sm text-fog">{t("Vidas", "Lives")}</p>
              <div className="mt-2">
                <Hearts lives={lives} />
              </div>
              {!user.isPro && (
                <Link href="/planes" className="mt-4 block text-sm font-semibold text-brand hover:underline">
                  {t("Vidas infinitas con Pro", "Unlimited lives with Pro")}
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-desk-line bg-desk-2 p-5">
                <Zap className="h-5 w-5 text-[#f59e0b]" strokeWidth={2} aria-hidden />
                <p className="mt-2 font-display text-3xl tabular-nums">{xp}</p>
                <p className="text-xs text-fog">{t("XP total", "Total XP")}</p>
              </div>
              <div className="rounded-3xl border border-desk-line bg-desk-2 p-5">
                <Check className="h-5 w-5 text-ok" strokeWidth={2.5} aria-hidden />
                <p className="mt-2 font-display text-3xl tabular-nums">
                  {doneCount}/{LESSON_ORDER.length}
                </p>
                <p className="text-xs text-fog">{t("lecciones", "lessons")}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl bg-field p-6">
            <p className="font-semibold">{t("Guarda tu avance", "Save your progress")}</p>
            <p className="mt-1 text-sm text-graphite">
              {t(
                "Crea tu cuenta gratis para empezar la inmersión, ganar XP y entrar al ranking.",
                "Create your free account to start the dive, earn XP and join the leaderboard.",
              )}
            </p>
            <Link href="/registro?next=/ruta" className="btn btn-primary mt-4 h-11 w-full">
              {t("Crear cuenta gratis", "Sign up free")}
            </Link>
          </div>
        )}
        <Link
          href="/diaria"
          className="flex items-center gap-3 rounded-3xl border border-desk-line bg-desk-2 p-5 transition-colors hover:border-brand"
        >
          <CalendarDays className="h-6 w-6 text-[#f97316]" strokeWidth={1.75} aria-hidden />
          <span>
            <span className="block font-semibold">{t("La estafa del día", "Scam of the day")}</span>
            <span className="text-sm text-fog">{t("Un caso nuevo hoy · 30 segundos", "A new case today · 30 seconds")}</span>
          </span>
        </Link>
        <Link
          href="/ranking"
          className="flex items-center gap-3 rounded-3xl border border-desk-line bg-desk-2 p-5 transition-colors hover:border-brand"
        >
          <Trophy className="h-6 w-6 text-[#f59e0b]" strokeWidth={1.75} aria-hidden />
          <span>
            <span className="block font-semibold">{t("Ranking mundial", "Global leaderboard")}</span>
            <span className="text-sm text-fog">{t("Compara tu XP con el resto", "Compare your XP with everyone")}</span>
          </span>
        </Link>
      </aside>
    </div>
  );
}

export default function RutaPage() {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-[80vh] max-w-[1100px] animate-pulse rounded-3xl bg-desk-3" />}>
        <PathMap />
      </Suspense>
    </PageShell>
  );
}
