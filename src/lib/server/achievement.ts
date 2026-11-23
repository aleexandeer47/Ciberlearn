import "server-only";
import { currentStreak } from "@/lib/daily";
import { dayKey } from "@/lib/dayKey";
import { LESSONS } from "@/lib/path/content";
import { publicName } from "@/lib/ranking";
import type { Lang } from "@/lib/i18n";
import { levelFor } from "@/lib/stats";
import { collections } from "./db";

/** Datos públicos de una tarjeta de logro. Solo apodo y cifras: nunca nombre real ni correo. */
export async function achievementByShareId(shareId: string, lang: Lang = "es") {
  if (!/^[\w-]{6,20}$/.test(shareId)) return null;
  const { users } = await collections();
  const u = await users.findOne({ shareId }, { projection: { nickname: 1, xp: 1, path: 1, daily: 1 } });
  if (!u) return null;
  const xp = u.xp ?? 0;
  return {
    name: publicName(u),
    xp,
    level: levelFor(xp, lang),
    lessons: u.path?.completed?.length ?? 0,
    totalLessons: LESSONS.length,
    streak: currentStreak(u.daily, dayKey()),
    bestStreak: u.daily?.best ?? 0,
  };
}
