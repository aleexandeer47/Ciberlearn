"use server";

import { ObjectId } from "mongodb";
import { requestLang } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";
import { pushEnabled } from "@/lib/server/push";
import { getCurrentUser } from "@/lib/server/session";

export interface PushSubInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

const valid = (s: PushSubInput) =>
  typeof s?.endpoint === "string" &&
  /^https:\/\//.test(s.endpoint) &&
  s.endpoint.length < 1000 &&
  typeof s.keys?.p256dh === "string" &&
  typeof s.keys?.auth === "string" &&
  s.keys.p256dh.length < 200 &&
  s.keys.auth.length < 100;

/** Guarda la suscripción del navegador para el recordatorio diario (con o sin cuenta). */
/** reason: "config" = faltan las claves VAPID en el servidor · "invalid" = suscripción mal formada */
export async function savePushSub(sub: PushSubInput): Promise<{ ok: boolean; reason?: "config" | "invalid" }> {
  if (!pushEnabled()) return { ok: false, reason: "config" };
  if (!valid(sub)) return { ok: false, reason: "invalid" };
  const [lang, user] = await Promise.all([requestLang(), getCurrentUser()]);
  const { pushSubs } = await collections();
  await pushSubs.updateOne(
    { endpoint: sub.endpoint },
    {
      $set: { keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth }, lang, ...(user ? { userId: user._id } : {}) },
      $setOnInsert: { _id: new ObjectId(), createdAt: new Date() },
    },
    { upsert: true },
  );
  return { ok: true };
}

export async function deletePushSub(endpoint: string): Promise<{ ok: boolean }> {
  if (typeof endpoint !== "string" || endpoint.length > 1000) return { ok: false };
  const { pushSubs } = await collections();
  await pushSubs.deleteOne({ endpoint });
  return { ok: true };
}
