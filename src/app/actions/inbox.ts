"use server";

import { ObjectId } from "mongodb";
import { gradeInbox, INBOX_ACTIONS, INBOX_BY_ID, localizeInbox, pickInbox, publicInbox, type InboxAction, type PublicInboxEmail } from "@/lib/inbox";
import { requestT } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { addXp } from "@/lib/server/xp";

const XP_SESSIONS_PER_DAY = 3;

export type StartInbox = { ok: true; sessionId: string; emails: PublicInboxEmail[] } | { ok: false; error: string };

/** Abre una bandeja nueva con 8 correos al azar. Exclusivo de Pro (también por empresa). */
export async function startInbox(): Promise<StartInbox> {
  const [user, { lang, t }] = await Promise.all([getCurrentUser(), requestT()]);
  if (!user) return { ok: false, error: t("Entra a tu cuenta.", "Log in to your account.") };
  if (!user.isPro) return { ok: false, error: t("La bandeja de entrenamiento es parte del plan Pro.", "The training inbox is part of the Pro plan.") };
  const { inboxSessions } = await collections();
  const emailIds = pickInbox();
  const _id = new ObjectId();
  await inboxSessions.insertOne({ _id, userId: user._id, emailIds, createdAt: new Date() });
  return { ok: true, sessionId: _id.toHexString(), emails: emailIds.map((id) => publicInbox(localizeInbox(INBOX_BY_ID.get(id)!, lang))) };
}

export type FinishInbox =
  | ({ ok: true; xp: number } & ReturnType<typeof gradeInbox>)
  | { ok: false; error: string };

/** Califica la bandeja en el servidor. La sesión se borra al usarla: no se puede enviar dos veces. */
export async function finishInbox(sessionId: string, actions: Record<string, InboxAction>): Promise<FinishInbox> {
  const [user, { lang, t }] = await Promise.all([getCurrentUser(), requestT()]);
  if (!user) return { ok: false, error: t("Entra a tu cuenta.", "Log in to your account.") };
  if (!ObjectId.isValid(sessionId)) return { ok: false, error: t("Sesión no válida.", "Invalid session.") };
  const over = t("Esta bandeja ya terminó. Abre una nueva.", "This inbox is finished. Open a new one.");
  const { inboxSessions, inboxResults } = await collections();
  const session = await inboxSessions.findOne({ _id: new ObjectId(sessionId), userId: user._id });
  if (!session) return { ok: false, error: over };
  if (session.emailIds.some((id) => !INBOX_ACTIONS.includes(actions?.[id])))
    return { ok: false, error: t("Decide qué hacer con todos los correos.", "Decide what to do with every email.") };
  // Se toma y se borra en un paso: no se puede calificar dos veces
  const taken = await inboxSessions.findOneAndDelete({ _id: session._id, userId: user._id });
  if (!taken) return { ok: false, error: over };

  const r = gradeInbox(taken.emailIds, actions, lang);
  const since = new Date(Date.now() - 864e5);
  const today = await inboxResults.countDocuments({ userId: user._id, createdAt: { $gt: since } });
  await inboxResults.insertOne({
    _id: new ObjectId(),
    userId: user._id,
    ...(user.org?.active ? { orgId: user.org._id } : {}),
    score: r.score,
    reported: r.reported,
    phishing: r.phishing,
    clicked: r.clicked,
    falsePositives: r.falsePositives,
    createdAt: new Date(),
  });
  const xp = today < XP_SESSIONS_PER_DAY ? await addXp(user._id, Math.round(r.score / 5), "bandeja") : 0;
  return { ok: true, xp, ...r };
}
