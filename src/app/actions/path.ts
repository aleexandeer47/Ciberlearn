"use server";

import { ObjectId } from "mongodb";
import { isUnlocked, LESSON_BY_ID, LESSON_ORDER, XP } from "@/lib/path/content";
import { loseOne, regen, view, type LivesView } from "@/lib/lives";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { addXp } from "@/lib/server/xp";

/*
 * Ruta guiada. El servidor decide todo: qué lección está disponible, si una
 * respuesta es correcta, cuántas vidas quedan y cuánto XP se gana.
 */

type Fail = { ok: false; error: "login" | "bloqueada" | "sin-vidas" | "invalido"; lives?: LivesView };

export async function startLesson(lessonId: string): Promise<{ ok: true; lives: LivesView } | Fail> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  const { users, lessonAttempts } = await collections();
  const doc = await users.findOne({ _id: user._id }, { projection: { lives: 1, path: 1 } });
  const completed = new Set(doc?.path?.completed ?? []);
  if (!LESSON_BY_ID.has(lessonId) || !isUnlocked(lessonId, completed)) return { ok: false, error: "bloqueada" };

  const lives = view(doc?.lives, user.isPro);
  if (!lives.infinite && lives.count <= 0) return { ok: false, error: "sin-vidas", lives };

  await lessonAttempts.updateOne(
    { userId: user._id, lessonId },
    { $set: { answers: {}, startedAt: new Date() }, $setOnInsert: { _id: new ObjectId() } },
    { upsert: true },
  );
  return { ok: true, lives };
}

export interface AnswerResult {
  ok: true;
  correct: boolean;
  /** "phishing" | "legit" o el índice de la opción correcta */
  answer: string | number;
  explain: string;
  lives: LivesView;
}

export async function answerExercise(lessonId: string, exerciseId: string, choice: string | number): Promise<AnswerResult | Fail> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  const lesson = LESSON_BY_ID.get(lessonId);
  const ex = lesson?.exercises.find((x) => x.id === exerciseId);
  if (!lesson || !ex) return { ok: false, error: "invalido" };

  const { users, lessonAttempts } = await collections();
  const attempt = await lessonAttempts.findOne({ userId: user._id, lessonId });
  if (!attempt) return { ok: false, error: "invalido" };
  const doc = await users.findOne({ _id: user._id }, { projection: { lives: 1 } });

  const correct = ex.kind === "veredicto" ? choice === ex.answer : Number(choice) === ex.answer;
  const already = exerciseId in attempt.answers;

  if (!already) {
    if (!user.isPro) {
      const now = new Date();
      const current = regen(doc?.lives, now);
      if (current.count <= 0) return { ok: false, error: "sin-vidas", lives: view(current, false, now) };
      if (!correct) await users.updateOne({ _id: user._id }, { $set: { lives: loseOne(current, now) } });
    }
    // Solo cuenta la primera respuesta a cada ejercicio
    await lessonAttempts.updateOne({ _id: attempt._id }, { $set: { [`answers.${exerciseId}`]: correct } });
  }

  const fresh = await users.findOne({ _id: user._id }, { projection: { lives: 1 } });
  return { ok: true, correct, answer: ex.answer, explain: ex.explain, lives: view(fresh?.lives, user.isPro) };
}

export interface CompleteResult {
  ok: true;
  xp: number;
  correct: number;
  total: number;
  firstTime: boolean;
  nextLessonId: string | null;
}

export async function completeLesson(lessonId: string): Promise<CompleteResult | Fail> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  const lesson = LESSON_BY_ID.get(lessonId);
  if (!lesson) return { ok: false, error: "invalido" };

  const { users, lessonAttempts } = await collections();
  // Se toma y se borra el intento en un paso: no se puede cobrar dos veces el XP.
  const attempt = await lessonAttempts.findOneAndDelete({ userId: user._id, lessonId });
  if (!attempt || lesson.exercises.some((x) => !(x.id in attempt.answers))) return { ok: false, error: "invalido" };

  const correct = Object.values(attempt.answers).filter(Boolean).length;
  const before = await users.findOneAndUpdate(
    { _id: user._id },
    { $addToSet: { "path.completed": lessonId } },
    { projection: { path: 1 } },
  );
  const firstTime = !(before?.path?.completed ?? []).includes(lessonId);
  const xp = await addXp(user._id, firstTime ? correct * XP.correct + XP.lessonBonus : correct * XP.repeatCorrect, "ruta");

  const i = LESSON_ORDER.indexOf(lessonId);
  return { ok: true, xp, correct, total: lesson.exercises.length, firstTime, nextLessonId: LESSON_ORDER[i + 1] ?? null };
}
