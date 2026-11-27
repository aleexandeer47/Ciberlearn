"use server";

import { ObjectId } from "mongodb";
import { requestLang } from "@/lib/i18n-server";
import { BOSS, bossTally, gradeExercise, isUnlocked, LESSON_BY_ID, LESSON_ORDER, localizeExercise, XP, type ExerciseChoice } from "@/lib/path/content";
import { loseOne, regen, view, type LivesView } from "@/lib/lives";
import { collections } from "@/lib/server/db";
import { extraUnlocked, getCurrentUser } from "@/lib/server/session";
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
  const open = isUnlocked(lessonId, completed) || extraUnlocked(user).has(lessonId);
  if (!LESSON_BY_ID.has(lessonId) || !open) return { ok: false, error: "bloqueada" };

  const lives = view(doc?.lives, user.isPro);
  if (!lives.infinite && lives.count <= 0) return { ok: false, error: "sin-vidas", lives };

  await lessonAttempts.updateOne(
    { userId: user._id, lessonId },
    { $set: { answers: {}, served: {}, startedAt: new Date() }, $setOnInsert: { _id: new ObjectId() } },
    { upsert: true },
  );
  return { ok: true, lives };
}

/**
 * Batalla: marca el momento en que se muestra una pregunta. El tiempo límite se cuenta desde aquí,
 * en el servidor, para que no se pueda ganar tiempo pausando el navegador. Volver a pedirla no lo reinicia.
 */
export async function serveBossQuestion(lessonId: string, exerciseId: string): Promise<{ ok: true } | Fail> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  const lesson = LESSON_BY_ID.get(lessonId);
  if (!lesson?.boss || !lesson.exercises.some((x) => x.id === exerciseId)) return { ok: false, error: "invalido" };
  const { lessonAttempts } = await collections();
  const attempt = await lessonAttempts.findOne({ userId: user._id, lessonId });
  if (!attempt) return { ok: false, error: "invalido" };
  const tally = bossTally(attempt.answers);
  if (tally.won || tally.lost || exerciseId in attempt.answers) return { ok: false, error: "invalido" };
  if (!attempt.served?.[exerciseId]) await lessonAttempts.updateOne({ _id: attempt._id }, { $set: { [`served.${exerciseId}`]: new Date() } });
  return { ok: true };
}

export interface AnswerResult {
  ok: true;
  correct: boolean;
  /** "phishing" | "legit", el índice de la opción correcta o la lista de índices (señales / orden) */
  answer: string | number | number[];
  explain: string;
  lives: LivesView;
  /** Batalla: la respuesta llegó fuera de tiempo */
  timedOut?: boolean;
}

export async function answerExercise(lessonId: string, exerciseId: string, choice: ExerciseChoice): Promise<AnswerResult | Fail> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  const lesson = LESSON_BY_ID.get(lessonId);
  const ex = lesson?.exercises.find((x) => x.id === exerciseId);
  if (!lesson || !ex) return { ok: false, error: "invalido" };

  const { users, lessonAttempts } = await collections();
  const attempt = await lessonAttempts.findOne({ userId: user._id, lessonId });
  if (!attempt) return { ok: false, error: "invalido" };
  const doc = await users.findOne({ _id: user._id }, { projection: { lives: 1 } });

  // Listas: solo enteros (índices), sin repetir y del tamaño razonable
  if (Array.isArray(choice) && (choice.length > 12 || choice.some((n) => !Number.isInteger(n) || n < 0 || n > 20))) return { ok: false, error: "invalido" };
  let correct = gradeExercise(ex, choice);
  let timedOut = false;
  if (lesson.boss) {
    // Batalla terminada: ya no se aceptan respuestas
    const tally = bossTally(attempt.answers);
    if (tally.won || tally.lost) return { ok: false, error: "invalido" };
    // Sin pregunta servida o fuera de tiempo, cuenta como ataque recibido
    const served = attempt.served?.[exerciseId];
    if (!served || Date.now() - served.getTime() > BOSS.seconds * 1000 + BOSS.graceMs) {
      timedOut = true;
      correct = false;
    }
  }
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
  const explain = localizeExercise(ex, await requestLang()).explain;
  return { ok: true, correct, answer: ex.answer, explain, lives: view(fresh?.lives, user.isPro), ...(timedOut ? { timedOut } : {}) };
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
  // La batalla se completa al vencer al Leviatán (no hace falta responder todas las preguntas).
  const attempt = await lessonAttempts.findOneAndDelete({ userId: user._id, lessonId });
  const finished = lesson.boss ? !!attempt && bossTally(attempt.answers).won : !!attempt && lesson.exercises.every((x) => x.id in attempt.answers);
  if (!attempt || !finished) {
    // Si la batalla no se ganó, el intento se conserva para no perder lo respondido
    if (attempt && lesson.boss) await lessonAttempts.insertOne(attempt);
    return { ok: false, error: "invalido" };
  }

  const correct = Object.values(attempt.answers).filter(Boolean).length;
  const before = await users.findOneAndUpdate(
    { _id: user._id },
    { $addToSet: { "path.completed": lessonId } },
    { projection: { path: 1 } },
  );
  const firstTime = !(before?.path?.completed ?? []).includes(lessonId);
  const bonus = lesson.boss ? XP.bossBonus : XP.lessonBonus;
  const xp = await addXp(user._id, firstTime ? correct * XP.correct + bonus : correct * XP.repeatCorrect, "ruta");

  const i = LESSON_ORDER.indexOf(lessonId);
  const total = lesson.boss ? Object.keys(attempt.answers).length : lesson.exercises.length;
  return { ok: true, xp, correct, total, firstTime, nextLessonId: LESSON_ORDER[i + 1] ?? null };
}
