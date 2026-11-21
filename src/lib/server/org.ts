import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { orgActive, pct } from "@/lib/business";
import { LESSONS } from "@/lib/path/content";
import { CATEGORY_LABELS } from "@/lib/scenarios/categories";
import type { SignalCategory } from "@/lib/scenarios/types";
import { collections } from "./db";

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const newInviteCode = () => randomBytes(9).toString("base64url");
export const newSimToken = () => randomBytes(24).toString("base64url");

export type JoinResult = "joined" | "invalid" | "inactive" | "full" | "already" | "other-org";

/** Une a una persona a la empresa del código. Respeta los puestos de forma atómica. */
export async function joinOrg(userId: ObjectId, code: string): Promise<{ result: JoinResult; orgId?: ObjectId; orgName?: string }> {
  const { orgs, users } = await collections();
  const org = await orgs.findOne({ inviteCode: code });
  if (!org) return { result: "invalid" };
  if (!orgActive(org.paidUntil)) return { result: "inactive" };

  const user = await users.findOne({ _id: userId }, { projection: { orgId: 1 } });
  if (user?.orgId?.equals(org._id)) return { result: "already" };
  if (user?.orgId) return { result: "other-org" };

  // Reserva un puesto solo si queda alguno
  const reserved = await orgs.findOneAndUpdate(
    { _id: org._id, $expr: { $lt: ["$memberCount", "$seats"] } },
    { $inc: { memberCount: 1 } },
  );
  if (!reserved) return { result: "full" };

  const r = await users.updateOne(
    { _id: userId, orgId: { $exists: false } },
    { $set: { orgId: org._id, orgRole: "member", orgJoinedAt: new Date() } },
  );
  if (r.modifiedCount === 0) {
    await orgs.updateOne({ _id: org._id }, { $inc: { memberCount: -1 } });
    return { result: "other-org" };
  }
  return { result: "joined", orgId: org._id, orgName: org.name };
}

/** Saca a un empleado (no al encargado) y libera su puesto. */
export async function removeFromOrg(orgId: ObjectId, userId: ObjectId) {
  const { orgs, users } = await collections();
  const r = await users.updateOne(
    { _id: userId, orgId, orgRole: "member" },
    { $unset: { orgId: "", orgRole: "", orgJoinedAt: "" } },
  );
  if (r.modifiedCount === 1) await orgs.updateOne({ _id: orgId }, { $inc: { memberCount: -1 } });
  return r.modifiedCount === 1;
}

export interface MemberRow {
  id: string;
  name: string;
  email: string;
  role: "owner" | "member";
  joinedAt: Date | null;
  lastLoginAt: Date | null;
  xp: number;
  lessonsDone: number;
  runs: number;
  avgScore: number;
  lastRunAt: Date | null;
  weakest: string | null;
  simsSent: number;
  simsClicked: number;
}

/** Todo lo que ve el encargado: avance de cada persona, puntos débiles del equipo y simulacros. */
export async function teamReport(orgId: ObjectId) {
  const { users, runs, phishTargets, phishCampaigns } = await collections();
  const members = await users
    .find(
      { orgId },
      { projection: { name: 1, email: 1, orgRole: 1, orgJoinedAt: 1, lastLoginAt: 1, xp: 1, path: 1 } },
    )
    .sort({ orgRole: -1, name: 1 })
    .toArray();
  const ids = members.map((m) => m._id);

  const [runAgg, skillAgg, simAgg, campaigns, campaignAgg] = await Promise.all([
    runs
      .aggregate<{ _id: ObjectId; n: number; avg: number; last: Date }>([
        { $match: { userId: { $in: ids } } },
        { $group: { _id: "$userId", n: { $sum: 1 }, avg: { $avg: "$score" }, last: { $max: "$createdAt" } } },
      ])
      .toArray(),
    runs
      .aggregate<{ _id: { u: ObjectId; c: SignalCategory }; total: number; found: number }>([
        { $match: { userId: { $in: ids } } },
        { $unwind: "$answers" },
        { $unwind: "$answers.signals" },
        {
          $group: {
            _id: { u: "$userId", c: "$answers.signals.category" },
            total: { $sum: 1 },
            found: { $sum: { $cond: ["$answers.signals.found", 1, 0] } },
          },
        },
      ])
      .toArray(),
    phishTargets
      .aggregate<{ _id: ObjectId; sent: number; clicked: number }>([
        { $match: { orgId, sentAt: { $ne: null } } },
        { $group: { _id: "$userId", sent: { $sum: 1 }, clicked: { $sum: { $cond: [{ $ifNull: ["$clickedAt", false] }, 1, 0] } } } },
      ])
      .toArray(),
    phishCampaigns.find({ orgId }).sort({ createdAt: -1 }).limit(10).toArray(),
    phishTargets
      .aggregate<{ _id: ObjectId; clicked: number }>([
        { $match: { orgId, clickedAt: { $exists: true } } },
        { $group: { _id: "$campaignId", clicked: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const runBy = new Map(runAgg.map((r) => [r._id.toHexString(), r]));
  const simBy = new Map(simAgg.map((r) => [r._id.toHexString(), r]));
  const clickBy = new Map(campaignAgg.map((r) => [r._id.toHexString(), r.clicked]));

  // Habilidad más débil por persona y del equipo completo (solo categorías con al menos 3 señales vistas)
  const perUser = new Map<string, { c: SignalCategory; total: number; found: number }[]>();
  const team = new Map<SignalCategory, { total: number; found: number }>();
  for (const s of skillAgg) {
    const k = s._id.u.toHexString();
    perUser.set(k, [...(perUser.get(k) ?? []), { c: s._id.c, total: s.total, found: s.found }]);
    const t = team.get(s._id.c) ?? { total: 0, found: 0 };
    t.total += s.total;
    t.found += s.found;
    team.set(s._id.c, t);
  }
  const weakestOf = (list: { c: SignalCategory; total: number; found: number }[]) => {
    const seen = list.filter((x) => x.total >= 3).sort((a, b) => a.found / a.total - b.found / b.total);
    return seen[0] ? CATEGORY_LABELS[seen[0].c]?.label ?? seen[0].c : null;
  };

  const rows: MemberRow[] = members.map((m) => {
    const k = m._id.toHexString();
    const r = runBy.get(k);
    const s = simBy.get(k);
    return {
      id: k,
      name: m.name,
      email: m.email,
      role: m.orgRole ?? "member",
      joinedAt: m.orgJoinedAt ?? null,
      lastLoginAt: m.lastLoginAt ?? null,
      xp: m.xp ?? 0,
      lessonsDone: m.path?.completed?.length ?? 0,
      runs: r?.n ?? 0,
      avgScore: r ? Math.round(r.avg) : 0,
      lastRunAt: r?.last ?? null,
      weakest: weakestOf(perUser.get(k) ?? []),
      simsSent: s?.sent ?? 0,
      simsClicked: s?.clicked ?? 0,
    };
  });

  const skills = [...team.entries()]
    .map(([c, v]) => ({ category: c, label: CATEGORY_LABELS[c]?.label ?? c, pct: pct(v.found, v.total), total: v.total }))
    .sort((a, b) => a.pct - b.pct);

  const sent = rows.reduce((a, r) => a + r.simsSent, 0);
  const clicked = rows.reduce((a, r) => a + r.simsClicked, 0);

  return {
    rows,
    totalLessons: LESSONS.length,
    skills,
    sims: { sent, clicked, rate: pct(clicked, sent) },
    campaigns: campaigns.map((c) => ({
      id: c._id.toHexString(),
      templateId: c.templateId,
      createdAt: c.createdAt,
      sent: c.sent,
      clicked: clickBy.get(c._id.toHexString()) ?? 0,
    })),
  };
}

export type TeamReport = Awaited<ReturnType<typeof teamReport>>;
