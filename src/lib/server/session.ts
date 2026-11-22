import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { AREAS, orgActive, type AreaId, type OrgKind } from "@/lib/business";
import { isProActive } from "@/lib/plans";
import { collections } from "./db";
import { env } from "./env";
import { bump } from "./metrics";
import type { UserDoc } from "./models";

const COOKIE = "ciberlearn_session";
const MAX_AGE_DAYS = 30;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export async function createSession(userId: UserDoc["_id"]) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + MAX_AGE_DAYS * 864e5);
  const { sessions, users } = await collections();
  await sessions.insertOne({ _id: new ObjectId(), tokenHash: sha256(token), userId, createdAt: now, expiresAt });
  await users.updateOne({ _id: userId }, { $set: { lastLoginAt: now } });
  await bump("logins");
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
  /** Fin del Pro individual (comprado por la persona) */
  proUntil: Date | null;
  /** Pro activo por compra propia o por pertenecer a una empresa con plan vigente */
  isPro: boolean;
  /** Hasta cuándo tiene Pro, por la vía que dure más; null si no tiene */
  proEnds: Date | null;
  isAdmin: boolean;
  org: {
    _id: ObjectId;
    kind: OrgKind;
    name: string;
    role: "owner" | "member";
    active: boolean;
    paidUntil: Date | null;
    area: AreaId | null;
  } | null;
}

/** Lecciones que se abren sin seguir el orden: las del área asignada por una empresa con plan vigente. */
export function extraUnlocked(user: CurrentUser | null): ReadonlySet<string> {
  const area = user?.org?.active ? user.org.area : null;
  return new Set(area ? AREAS[area].lessons : []);
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

  let org: CurrentUser["org"] = null;
  if (user.orgId) {
    const { orgs } = await collections();
    const o = await orgs.findOne({ _id: user.orgId }, { projection: { name: 1, paidUntil: 1, kind: 1 } });
    if (o)
      org = {
        _id: o._id,
        kind: o.kind ?? "empresa",
        name: o.name,
        role: user.orgRole ?? "member",
        active: orgActive(o.paidUntil),
        paidUntil: o.paidUntil,
        area: user.orgArea ?? null,
      };
  }
  const own = isProActive(user.proUntil);
  const ends = [own ? user.proUntil : null, org?.active ? org.paidUntil : null].filter((d): d is Date => !!d);

  return {
    id: user._id.toHexString(),
    _id: user._id,
    email: user.email,
    name: user.name,
    proUntil: user.proUntil,
    isPro: ends.length > 0,
    proEnds: ends.length ? new Date(Math.max(...ends.map((d) => d.getTime()))) : null,
    isAdmin: user.role === "admin",
    org,
  };
});
