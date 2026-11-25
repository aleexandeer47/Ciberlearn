"use server";

import { CALL_BY_ID, CALL_XP, callOfDay, callXp, type CallEnd, type CallVerdict } from "@/lib/calls";
import { dayKey } from "@/lib/dayKey";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { addXp } from "@/lib/server/xp";

const ENDS: CallEnd[] = ["fell", "safe", "ok", "declined"];

/**
 * Termina una llamada simulada. El XP depende de juzgar bien si era estafa o real (callXp),
 * hasta 3 llamadas con XP por día. Sin cuenta no se guarda nada.
 */
export async function finishCall(id: string, outcome: CallEnd, verdict: CallVerdict | null): Promise<{ xp: number }> {
  const user = await getCurrentUser();
  const call = CALL_BY_ID.get(id);
  if (!user || !call || !ENDS.includes(outcome)) return { xp: 0 };
  if (verdict !== null && verdict !== "estafa" && verdict !== "real") return { xp: 0 };
  // Una llamada real no se puede "caer"; una estafa no termina en "ok"
  if ((outcome === "fell" && !call.scam) || (outcome === "ok" && call.scam)) return { xp: 0 };
  // Sin Pro solo cuenta la llamada del día
  if (!user.isPro && callOfDay(dayKey()).id !== id) return { xp: 0 };
  const { xpEvents } = await collections();
  const since = new Date(Date.now() - 864e5);
  if ((await xpEvents.countDocuments({ userId: user._id, source: "llamada", createdAt: { $gt: since } })) >= CALL_XP.perDay) return { xp: 0 };
  return { xp: await addXp(user._id, callXp(call, outcome, verdict), "llamada") };
}
