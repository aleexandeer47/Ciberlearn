"use server";

import { MongoServerError, ObjectId } from "mongodb";
import { caseForDay, DAILY_BY_ID, DAILY_XP, nextStreak } from "@/lib/daily";
import { dayKey } from "@/lib/dayKey";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { addXp } from "@/lib/server/xp";

export type DailyResult =
  | {
      ok: true;
      correct: boolean;
      answer: "phishing" | "legit";
      explain: string;
      tip: string;
      /** null si no hay sesión (no se guarda la racha) */
      streak: number | null;
      best: number | null;
      xp: number;
      already: boolean;
    }
  | { ok: false; error: string };

/** Responde la estafa del día. Con sesión guarda la respuesta (una por día), la racha y el XP. */
export async function answerDaily(choice: string): Promise<DailyResult> {
  if (choice !== "phishing" && choice !== "legit") return { ok: false, error: "Respuesta no válida." };
  const today = dayKey();
  const kase = caseForDay(today);
  const reveal = { answer: kase.answer, explain: kase.explain, tip: kase.tip };

  const user = await getCurrentUser();
  if (!user) return { ok: true, correct: choice === kase.answer, ...reveal, streak: null, best: null, xp: 0, already: false };

  const { users, dailyAnswers } = await collections();
  const correct = choice === kase.answer;
  try {
    await dailyAnswers.insertOne({ _id: new ObjectId(), userId: user._id, day: today, caseId: kase.id, correct, createdAt: new Date() });
  } catch (e) {
    if (!(e instanceof MongoServerError && e.code === 11000)) throw e;
    // Ya respondió hoy: se devuelve su primera respuesta, sin sumar nada
    const prev = await dailyAnswers.findOne({ userId: user._id, day: today });
    const doc = await users.findOne({ _id: user._id }, { projection: { daily: 1 } });
    const k = DAILY_BY_ID.get(prev?.caseId ?? "") ?? kase;
    return {
      ok: true,
      correct: !!prev?.correct,
      answer: k.answer,
      explain: k.explain,
      tip: k.tip,
      streak: doc?.daily?.streak ?? 1,
      best: doc?.daily?.best ?? 1,
      xp: 0,
      already: true,
    };
  }

  const doc = await users.findOne({ _id: user._id }, { projection: { daily: 1 } });
  const daily = nextStreak(doc?.daily, today);
  await users.updateOne({ _id: user._id }, { $set: { daily } });
  const xp = await addXp(user._id, correct ? DAILY_XP.correct : DAILY_XP.wrong, "diaria");
  return { ok: true, correct, ...reveal, streak: daily.streak, best: daily.best, xp, already: false };
}
