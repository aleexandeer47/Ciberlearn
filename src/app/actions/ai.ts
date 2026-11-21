"use server";

import Anthropic from "@anthropic-ai/sdk";
import { ObjectId } from "mongodb";
import { AI_LIMITS, PERSONA_BY_ID } from "@/lib/ai/personas";
import { dayKey } from "@/lib/dayKey";
import { aiConfigured, scammerTurn } from "@/lib/server/ai";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { addXp } from "@/lib/server/xp";

export type ChatMsg = { role: "user" | "assistant"; content: string };
type Err = { ok: false; error: string; code?: "login" | "limite" | "no-config" };

async function usedToday(userId: ObjectId) {
  const { aiChats } = await collections();
  return aiChats.countDocuments({ userId, day: dayKey() });
}

export async function startChat(personaId: string): Promise<{ ok: true; chatId: string; messages: ChatMsg[]; left: number } | Err> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Inicia sesión para usar los chats.", code: "login" };
  if (!aiConfigured()) return { ok: false, error: "Los chats con IA todavía no están configurados.", code: "no-config" };
  const persona = PERSONA_BY_ID.get(personaId);
  if (!persona) return { ok: false, error: "Ese escenario no existe." };

  const limit = user.isPro ? AI_LIMITS.proPerDay : AI_LIMITS.freePerDay;
  const used = await usedToday(user._id);
  if (used >= limit) {
    return {
      ok: false,
      code: "limite",
      error: user.isPro ? "Llegaste al máximo de chats de hoy. Vuelve mañana." : "Ya usaste tu chat gratis de hoy. Con Pro tienes chats ilimitados.",
    };
  }

  const { aiChats } = await collections();
  const now = new Date();
  const messages: ChatMsg[] = [{ role: "assistant", content: persona.opening }];
  const _id = new ObjectId();
  await aiChats.insertOne({ _id, userId: user._id, personaId, day: dayKey(now), messages, status: "active", createdAt: now, updatedAt: now });
  return { ok: true, chatId: _id.toHexString(), messages, left: limit - used - 1 };
}

export type SendResult =
  | { ok: true; reply: string; status: "active" | "won" | "lost"; feedback?: string; xp?: number; tactics: string[] }
  | Err;

export async function sendMessage(chatId: string, text: string): Promise<SendResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Inicia sesión.", code: "login" };
  const content = String(text ?? "").trim().slice(0, AI_LIMITS.maxMessageLength);
  if (!content) return { ok: false, error: "Escribe un mensaje." };
  if (!ObjectId.isValid(chatId)) return { ok: false, error: "Chat no válido." };

  const { aiChats } = await collections();
  // El historial vive en el servidor: el navegador no puede inventar mensajes del "estafador".
  const chat = await aiChats.findOne({ _id: new ObjectId(chatId), userId: user._id });
  if (!chat || chat.status !== "active") return { ok: false, error: "Este chat ya terminó." };
  const persona = PERSONA_BY_ID.get(chat.personaId)!;

  const userTurns = chat.messages.filter((m) => m.role === "user").length + 1;
  const history: ChatMsg[] = [...chat.messages, { role: "user", content }];

  let turn;
  try {
    turn = await scammerTurn(persona, history);
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return { ok: false, error: "Hay mucha demanda en este momento. Intenta en un minuto." };
    console.error("[ia] error al generar respuesta", e instanceof Anthropic.APIError ? e.status : e);
    return { ok: false, error: "No pudimos generar la respuesta. Intenta de nuevo." };
  }

  // Si se acaban los turnos sin caer, cuenta como que resistió.
  let outcome = turn.outcome;
  let feedback = turn.feedback;
  if (outcome === "continua" && userTurns >= AI_LIMITS.maxUserTurns) {
    outcome = "resistio";
    feedback ||= "Llegaste al final sin entregar ningún dato. Bien: con un estafador, cortar la conversación siempre es la mejor salida.";
  }

  const status = outcome === "cayo" ? "lost" : outcome === "resistio" ? "won" : "active";
  const newMessages: ChatMsg[] = status === "active" ? [...history, { role: "assistant", content: turn.reply }] : history;

  let xp = 0;
  if (status === "won") {
    const earnedToday = await aiChats
      .aggregate<{ xp: number }>([{ $match: { userId: user._id, day: chat.day } }, { $group: { _id: null, xp: { $sum: { $ifNull: ["$xpAwarded", 0] } } } }])
      .toArray();
    const room = Math.max(0, AI_LIMITS.xpDailyCap - (earnedToday[0]?.xp ?? 0));
    xp = Math.min(AI_LIMITS.xpWin, room);
  }

  // Solo se actualiza si sigue activo: evita duplicar XP con dos envíos simultáneos.
  const updated = await aiChats.updateOne(
    { _id: chat._id, status: "active", messages: { $size: chat.messages.length } },
    {
      $set: {
        messages: newMessages,
        status,
        updatedAt: new Date(),
        ...(status !== "active" ? { verdict: feedback, xpAwarded: xp } : {}),
      },
    },
  );
  if (updated.modifiedCount === 0) return { ok: false, error: "El chat cambió mientras respondías. Recarga la página." };
  if (xp > 0) await addXp(user._id, xp, "ia");

  return { ok: true, reply: status === "active" ? turn.reply : "", status, feedback: status !== "active" ? feedback : undefined, xp, tactics: turn.tactics };
}

export async function chatsLeft(): Promise<{ left: number; limit: number; isPro: boolean; configured: boolean } | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const limit = user.isPro ? AI_LIMITS.proPerDay : AI_LIMITS.freePerDay;
  return { left: Math.max(0, limit - (await usedToday(user._id))), limit, isPro: user.isPro, configured: aiConfigured() };
}
