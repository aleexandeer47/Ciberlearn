import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { isProActive } from "@/lib/plans";
import { collections } from "./db";
import { env } from "./env";
import type { UserDoc } from "./models";

const COOKIE = "ciberlearn_session";
const MAX_AGE_DAYS = 30;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export async function createSession(userId: UserDoc["_id"]) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + MAX_AGE_DAYS * 864e5);
  const { sessions } = await collections();
  await sessions.insertOne({ _id: new ObjectId(), tokenHash: sha256(token), userId, createdAt: now, expiresAt });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const { sessions } = await collections();
    await sessions.deleteOne({ tokenHash: sha256(token) });
  }
  jar.delete(COOKIE);
}

export interface CurrentUser {
  id: string;
  _id: UserDoc["_id"];
  email: string;
  name: string;
  proUntil: Date | null;
  isPro: boolean;
}

/** Usuario de la petición actual (memoizado por petición con React cache). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  // Lo que sigue (base de datos, fecha actual) es siempre por petición.
  await connection();
  const { sessions, users } = await collections();
  const session = await sessions.findOne({ tokenHash: sha256(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await users.findOne({ _id: session.userId }, { projection: { passwordHash: 0 } });
  if (!user) return null;
  return {
    id: user._id.toHexString(),
    _id: user._id,
    email: user.email,
    name: user.name,
    proUntil: user.proUntil,
    isPro: isProActive(user.proUntil),
  };
});
