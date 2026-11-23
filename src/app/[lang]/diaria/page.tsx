import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { DailyCard } from "@/components/daily/DailyCard";
import { PushToggle } from "@/components/daily/PushToggle";
import { PageShell } from "@/components/SiteHeader";
import { caseForDay, currentStreak, DAILY_BY_ID, localizeDaily, publicDaily } from "@/lib/daily";
import { dayKey } from "@/lib/dayKey";
import { LOCALE } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    alternates: await alternatesFor("/diaria"),
    title: t("La estafa del día", "Scam of the day"),
    description: t(
      "Un mensaje nuevo cada día: ¿es trampa o es real? Responde en 30 segundos y mantén tu racha.",
      "A new message every day: scam or real? Answer in 30 seconds and keep your streak.",
    ),
  };
}

async function Today() {
  // El caso depende del día: siempre por petición
  await connection();
  const today = dayKey();
  const { lang, t } = await getT();
  const kase = caseForDay(today, lang);
  const user = await getCurrentUser();

  let initial = null;
  let streak = 0;
  if (user) {
    const { users, dailyAnswers } = await collections();
    const [doc, prev] = await Promise.all([
      users.findOne({ _id: user._id }, { projection: { daily: 1 } }),
      dailyAnswers.findOne({ userId: user._id, day: today }),
    ]);
    streak = currentStreak(doc?.daily, today);
    if (prev) {
      const found = DAILY_BY_ID.get(prev.caseId);
      const k = found ? localizeDaily(found, lang) : kase;
      initial = {
        ok: true as const,
        correct: prev.correct,
        answer: k.answer,
        explain: k.explain,
        tip: k.tip,
        streak,
        best: doc?.daily?.best ?? streak,
        xp: 0,
        already: false,
      };
    }
  }

  const date = new Date().toLocaleDateString(LOCALE[lang], { timeZone: "America/El_Salvador", weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="mx-auto max-w-2xl">
      <span className="eyebrow !inline-flex items-center gap-2">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden /> {date}
      </span>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">{t("La estafa del día", "Scam of the day")}</h1>
      <p className="mt-3 text-lg text-fog">
        {t("¿Es trampa o es real? Un caso nuevo cada día. 30 segundos.", "Scam or real? A new case every day. 30 seconds.")}
      </p>
      <div className="mt-8">
        <DailyCard kase={publicDaily(kase)} loggedIn={!!user} initial={initial} streak={streak} />
      </div>
      <div className="mt-6">
        <PushToggle />
      </div>
    </div>
  );
}

export default function DiariaPage() {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-96 max-w-2xl animate-pulse rounded-3xl bg-desk-3" />}>
        <Today />
      </Suspense>
    </PageShell>
  );
}
