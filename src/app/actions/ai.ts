"use server";

import Anthropic from "@anthropic-ai/sdk";
import { ObjectId } from "mongodb";
import { AI_LIMITS, personaById } from "@/lib/ai/personas";
import { requestT } from "@/lib/i18n-server";
import { dayKey } from "@/lib/dayKey";
import { aiEnabled, scammerTurn } from "@/lib/server/ai";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { addXp } from "@/lib/server/xp";

export type ChatMsg = { role: "user" | "assistant"; content: string };
type Err = { ok: false; error: string; code?: "login" | "limite" | "proximamente" | "pro" };

async function usedToday(userId: ObjectId) {
  const { aiChats } = await collections();
  return aiChats.countDocuments({ userId, day: dayKey() });
}

export async function startChat(personaId: string): Promise<{ ok: true; chatId: string; messages: ChatMsg[]; left: number } | Err> {
  // El servidor también lo bloquea: aunque alguien llame a la acción a mano, no gasta IA.
  const { lang, t } = await requestT();
  if (!aiEnabled())
    return { ok: false, error: t("Los chats con IA aún no están listos. Estamos trabajando en ello.", "AI chats aren't ready yet. We're working on it."), code: "proximamente" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: t("Inicia sesión para usar los chats.", "Log in to use the chats."), code: "login" };
  if (!user.isPro) return { ok: false, error: t("Los chats con IA son exclusivos del plan Pro.", "AI chats are Pro only."), code: "pro" };
  const persona = personaById(personaId, lang);
  if (!persona) return { ok: false, error: t("Ese escenario no existe.", "That scenario doesn't exist.") };

  const limit = AI_LIMITS.proPerDay;
  const used = await usedToday(user._id);
  if (used >= limit) return { ok: false, code: "limite", error: t("Llegaste al máximo de chats de hoy. Vuelve mañana.", "You've reached today's chat limit. Come back tomorrow.") };

  const { aiChats } = await collections();
  const now = new Date();
  const messages: ChatMsg[] = [{ role: "assistant", content: persona.opening }];
  const _id = new ObjectId();
  await aiChats.insertOne({ _id, userId: user._id, personaId, lang, day: dayKey(now), messages, status: "active", createdAt: now, updatedAt: now });
  return { ok: true, chatId: _id.toHexString(), messages, left: limit - used - 1 };
}

export type SendResult =
  | { ok: true; reply: string; status: "active" | "won" | "lost"; feedback?: string; xp?: number; tactics: string[] }
  | Err;

export async function sendMessage(chatId: string, text: string): Promise<SendResult> {
  const { t } = await requestT();
  if (!aiEnabled()) return { ok: false, error: t("Los chats con IA aún no están listos.", "AI chats aren't ready yet."), code: "proximamente" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: t("Inicia sesión.", "Log in."), code: "login" };
  if (!user.isPro) return { ok: false, error: t("Los chats con IA son exclusivos del plan Pro.", "AI chats are Pro only."), code: "pro" };
  const content = String(text ?? "").trim().slice(0, AI_LIMITS.maxMessageLength);
  if (!content) return { ok: false, error: t("Escribe un mensaje.", "Type a message.") };
  if (!ObjectId.isValid(chatId)) return { ok: false, error: t("Chat no válido.", "Invalid chat.") };

  const { aiChats } = await collections();
  // El historial vive en el servidor: el navegador no puede inventar mensajes del "estafador".
  const chat = await aiChats.findOne({ _id: new ObjectId(chatId), userId: user._id });
  if (!chat || chat.status !== "active") return { ok: false, error: t("Este chat ya terminó.", "This chat has ended.") };
  // Se sigue en el idioma en que empezó el chat
  const chatLang = chat.lang ?? "es";
  const persona = personaById(chat.personaId, chatLang)!;

  const userTurns = chat.messages.filter((m) => m.role === "user").length + 1;
  const history: ChatMsg[] = [...chat.messages, { role: "user", content }];

  let turn;
  try {
    turn = await scammerTurn(persona, history, chatLang);
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return { ok: false, error: t("Hay mucha demanda en este momento. Intenta en un minuto.", "There's a lot of demand right now. Try again in a minute.") };
    console.error("[ia] error al generar respuesta", e instanceof Anthropic.APIError ? e.status : e);
    return { ok: false, error: t("No pudimos generar la respuesta. Intenta de nuevo.", "We couldn't generate the reply. Please try again.") };
  }

  // Si se acaban los turnos sin caer, cuenta como que resistió.
  let outcome = turn.outcome;
  let feedback = turn.feedback;
  if (outcome === "continua" && userTurns >= AI_LIMITS.maxUserTurns) {
    outcome = "resistio";
    feedback ||=
      chatLang === "en"
        ? "You made it to the end without giving away any data. Well done: with a scammer, ending the conversation is always the best way out."
        : "Llegaste al final sin entregar ningún dato. Bien: con un estafador, cortar la conversación siempre es la mejor salida.";
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
  if (updated.modifiedCount === 0) return { ok: false, error: t("El chat cambió mientras respondías. Recarga la página.", "The chat changed while you were replying. Reload the page.") };
  if (xp > 0) await addXp(user._id, xp, "ia");

  return { ok: true, reply: status === "active" ? turn.reply : "", status, feedback: status !== "active" ? feedback : undefined, xp, tactics: turn.tactics };
}

export interface ChatAccess {
  /** false = la función aún no se lanzó: se muestra "próximamente" */
  enabled: boolean;
  loggedIn: boolean;
  isPro: boolean;
  left: number;
  limit: number;
}

export async function chatAccess(): Promise<ChatAccess> {
  const user = await getCurrentUser();
  const enabled = aiEnabled();
  const limit = AI_LIMITS.proPerDay;
  if (!user) return { enabled, loggedIn: false, isPro: false, left: 0, limit };
  const left = enabled && user.isPro ? Math.max(0, limit - (await usedToday(user._id))) : 0;
  return { enabled, loggedIn: true, isPro: user.isPro, left, limit };
}
