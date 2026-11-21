import "server-only";
import { ObjectId } from "mongodb";
import { collections } from "./db";
import type { XpEventDoc } from "./models";

/** Suma XP a la cuenta y deja el evento (para el ranking semanal). */
export async function addXp(userId: ObjectId, amount: number, source: XpEventDoc["source"]) {
  const n = Math.max(0, Math.round(amount));
  if (n === 0) return 0;
  const { users, xpEvents } = await collections();
  await Promise.all([
    users.updateOne({ _id: userId }, { $inc: { xp: n } }),
    xpEvents.insertOne({ _id: new ObjectId(), userId, amount: n, source, createdAt: new Date() }),
  ]);
  return n;
}

/** XP de una ronda del simulador: puntos de la ronda / 10 (una ronda perfecta de 10 mensajes = 100). */
export const xpFromRun = (points: number[]) => Math.round(points.reduce((a, b) => a + b, 0) / 10);
