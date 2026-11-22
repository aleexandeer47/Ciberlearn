"use server";

import { randomBytes } from "node:crypto";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

/** Crea (una sola vez) el enlace público de la tarjeta de logro y lo devuelve. */
export async function getShareLink(): Promise<{ ok: true; path: string } | { ok: false }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const { users } = await collections();
  await users.updateOne(
    { _id: user._id, shareId: { $exists: false } },
    { $set: { shareId: randomBytes(8).toString("base64url") } },
  );
  const doc = await users.findOne({ _id: user._id }, { projection: { shareId: 1 } });
  return doc?.shareId ? { ok: true, path: `/logro/${doc.shareId}` } : { ok: false };
}

/** Deja de compartir la tarjeta: el enlace anterior deja de funcionar. */
export async function stopSharing() {
  const user = await getCurrentUser();
  if (!user) return;
  const { users } = await collections();
  await users.updateOne({ _id: user._id }, { $unset: { shareId: "" } });
}
