"use server";

import { CALL_BY_ID, CALL_XP, callOfDay, type CallEnd } from "@/lib/calls";
import { dayKey } from "@/lib/dayKey";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { addXp } from "@/lib/server/xp";

/** Termina una llamada simulada: suma XP (hasta 3 llamadas por día). Sin cuenta no se guarda nada. */
export async function finishCall(id: string, outcome: CallEnd): Promise<{ xp: number }> {
  const user = await getCurrentUser();
  if (!user || !CALL_BY_ID.has(id) || (outcome !== "safe" && outcome !== "fell")) return { xp: 0 };
  // Sin Pro solo cuenta la llamada del día
  if (!user.isPro && callOfDay(dayKey()).id !== id) return { xp: 0 };
  const { xpEvents } = await collections();
  const since = new Date(Date.now() - 864e5);
  if ((await xpEvents.countDocuments({ userId: user._id, source: "llamada", createdAt: { $gt: since } })) >= CALL_XP.perDay) return { xp: 0 };
  return { xp: await addXp(user._id, CALL_XP[outcome], "llamada") };
}
