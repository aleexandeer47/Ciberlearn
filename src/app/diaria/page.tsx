import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { DailyCard } from "@/components/daily/DailyCard";
import { PageShell } from "@/components/SiteHeader";
import { caseForDay, currentStreak, DAILY_BY_ID, publicDaily } from "@/lib/daily";
import { dayKey } from "@/lib/dayKey";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "La estafa del día",
  description: "Un mensaje nuevo cada día: ¿es trampa o es real? Responde en 30 segundos y mantén tu racha.",
};

async function Today() {
  // El caso depende del día: siempre por petición
  await connection();
  const today = dayKey();
  const kase = caseForDay(today);
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
      const k = DAILY_BY_ID.get(prev.caseId) ?? kase;
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

  const date = new Date().toLocaleDateString("es-SV", { timeZone: "America/El_Salvador", weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="mx-auto max-w-2xl">
      <span className="eyebrow !inline-flex items-center gap-2">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden /> {date}
      </span>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">La estafa del día</h1>
      <p className="mt-3 text-lg text-fog">¿Es trampa o es real? Un caso nuevo cada día. 30 segundos.</p>
      <div className="mt-8">
        <DailyCard kase={publicDaily(kase)} loggedIn={!!user} initial={initial} streak={streak} />
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
