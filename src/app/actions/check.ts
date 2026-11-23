"use server";

import Anthropic from "@anthropic-ai/sdk";
import { ObjectId } from "mongodb";
import { AI_LIMITS } from "@/lib/ai/personas";
import { dayKey } from "@/lib/dayKey";
import { requestT } from "@/lib/i18n-server";
import { aiEnabled, checkWithAi, type CheckOutput } from "@/lib/server/ai";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export type AiCheckResult = ({ ok: true; left: number } & CheckOutput) | { ok: false; error: string; code?: "proximamente" | "login" | "pro" | "limite" };

const MAX_TEXT = 3000;

/** “¿Es estafa?” con IA (Pro). Solo cuenta el uso del día: el mensaje revisado no se guarda. */
export async function aiCheck(text: string): Promise<AiCheckResult> {
  const { lang, t } = await requestT();
  if (!aiEnabled())
    return { ok: false, code: "proximamente", error: t("El análisis con IA llegará pronto para Pro.", "AI analysis is coming soon to Pro.") };
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "login", error: t("Entra a tu cuenta.", "Log in to your account.") };
  if (!user.isPro) return { ok: false, code: "pro", error: t("El análisis con IA es parte del plan Pro.", "AI analysis is part of the Pro plan.") };
  const msg = String(text ?? "").trim().slice(0, MAX_TEXT);
  if (msg.length < 10) return { ok: false, error: t("Pega el mensaje completo.", "Paste the whole message.") };

  const { aiChecks } = await collections();
  const day = dayKey();
  const used = await aiChecks.countDocuments({ userId: user._id, day });
  if (used >= AI_LIMITS.proPerDay)
    return { ok: false, code: "limite", error: t("Llegaste al máximo de revisiones de hoy.", "You've reached today's check limit.") };

  try {
    const out = await checkWithAi(msg, lang);
    await aiChecks.insertOne({ _id: new ObjectId(), userId: user._id, day, createdAt: new Date() });
    return { ok: true, left: AI_LIMITS.proPerDay - used - 1, ...out };
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return { ok: false, error: t("Hay mucha demanda. Intenta en un minuto.", "There's a lot of demand. Try again in a minute.") };
    console.error("[revisar] IA", e instanceof Anthropic.APIError ? e.status : e);
    return { ok: false, error: t("No pudimos analizarlo. Intenta de nuevo.", "We couldn't analyze it. Please try again.") };
  }
}
