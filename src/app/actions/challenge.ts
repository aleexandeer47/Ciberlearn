"use server";

import { randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { CHALLENGE_SIZE, challengeOutcome, cleanPlayerName, pickRandom } from "@/lib/community";
import { requestT } from "@/lib/i18n-server";
import { EXERCISE_BY_ID, localizeExercise, VERDICT_POOL } from "@/lib/path/content";
import { publicName } from "@/lib/ranking";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

const MAX_PER_DAY = 20;
const MAX_PLAYS = 500;

/** Crea un reto con 5 mensajes al azar. Hace falta cuenta para crear; para jugar, no. */
export async function createChallenge() {
  const user = await getCurrentUser();
  if (!user) redirect(`/registro?next=${encodeURIComponent("/reto")}`);
  const { users, challenges } = await collections();
  const recent = await challenges.countDocuments({ creatorId: user._id, createdAt: { $gt: new Date(Date.now() - 864e5) } });
  if (recent >= MAX_PER_DAY) redirect("/reto?error=limite");

  const doc = await users.findOne({ _id: user._id }, { projection: { nickname: 1 } });
  const code = randomBytes(6).toString("base64url");
  await challenges.insertOne({
    _id: new ObjectId(),
    code,
    creatorId: user._id,
    creatorName: publicName({ _id: user._id, nickname: doc?.nickname }),
    exerciseIds: pickRandom(VERDICT_POOL, CHALLENGE_SIZE).map((x) => x.id),
    creatorScore: null,
    plays: 0,
    createdAt: new Date(),
  });
  redirect(`/reto/${code}`);
}

export interface ChallengeRow {
  name: string;
  score: number;
}

export type ChallengeResult =
  | {
      ok: true;
      score: number;
      total: number;
      results: { id: string; correct: boolean; answer: "phishing" | "legit"; explain: string }[];
      isCreator: boolean;
      creatorName: string;
      creatorScore: number | null;
      outcome: ReturnType<typeof challengeOutcome>;
      top: ChallengeRow[];
    }
  | { ok: false; error: string };

/** Califica un reto en el servidor (las respuestas nunca van al navegador antes de jugar). */
export async function submitChallenge(code: string, answers: string[], rawName: string): Promise<ChallengeResult> {
  const { lang, t } = await requestT();
  const { challenges, challengePlays, users } = await collections();
  const ch = await challenges.findOne({ code: String(code).slice(0, 20) });
  if (!ch) return { ok: false, error: t("Este reto ya no existe.", "This challenge no longer exists.") };
  if (!Array.isArray(answers) || answers.length !== ch.exerciseIds.length || answers.some((a) => a !== "phishing" && a !== "legit"))
    return { ok: false, error: t("Responde todos los mensajes.", "Answer every message.") };

  const results = ch.exerciseIds.map((id, i) => {
    const found = EXERCISE_BY_ID.get(id);
    const ex = found && localizeExercise(found, lang);
    const answer = ex?.kind === "veredicto" ? ex.answer : "phishing";
    return { id, correct: answers[i] === answer, answer, explain: ex?.explain ?? "" };
  });
  const score = results.filter((r) => r.correct).length;

  const user = await getCurrentUser();
  const isCreator = !!user && user._id.equals(ch.creatorId);
  let creatorScore = ch.creatorScore;

  if (isCreator) {
    // La primera partida de quien lo creó fija su marca
    if (creatorScore === null) {
      await challenges.updateOne({ _id: ch._id, creatorScore: null }, { $set: { creatorScore: score } });
      creatorScore = score;
    }
  } else if (ch.plays < MAX_PLAYS) {
    let name = cleanPlayerName(rawName);
    if (!name && user) {
      const doc = await users.findOne({ _id: user._id }, { projection: { nickname: 1 } });
      name = publicName({ _id: user._id, nickname: doc?.nickname });
    }
    await challengePlays.insertOne({
      _id: new ObjectId(),
      challengeId: ch._id,
      name: name ?? t("Anónimo", "Anonymous"),
      ...(user ? { userId: user._id } : {}),
      score,
      createdAt: new Date(),
    });
    await challenges.updateOne({ _id: ch._id }, { $inc: { plays: 1 } });
  }

  const top = await topPlays(ch._id);
  return {
    ok: true,
    score,
    total: results.length,
    results,
    isCreator,
    creatorName: ch.creatorName,
    creatorScore,
    outcome: isCreator ? null : challengeOutcome(score, creatorScore),
    top,
  };
}

async function topPlays(challengeId: ObjectId): Promise<ChallengeRow[]> {
  const { challengePlays } = await collections();
  const rows = await challengePlays.find({ challengeId }).sort({ score: -1, createdAt: 1 }).limit(10).toArray();
  return rows.map((r) => ({ name: r.name, score: r.score }));
}
