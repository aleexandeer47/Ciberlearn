"use server";

import { MongoServerError } from "mongodb";
import { revalidatePath } from "next/cache";
import { COUNTRIES, NICK_RE } from "@/lib/ranking";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export interface ProfileState {
  ok?: boolean;
  error?: string;
}

export async function updateProfile(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Inicia sesión para editar tu perfil." };

  const nickname = String(form.get("nickname") ?? "").trim();
  const country = String(form.get("country") ?? "");
  const showInRanking = form.get("showInRanking") === "on";

  if (!NICK_RE.test(nickname)) return { error: "El apodo debe tener de 3 a 20 letras, números, punto, guion o guion bajo." };
  if (!(country in COUNTRIES)) return { error: "Elige un país de la lista." };

  const { users } = await collections();
  try {
    await users.updateOne(
      { _id: user._id },
      { $set: { nickname, nicknameLower: nickname.toLowerCase(), country, showInRanking } },
    );
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) return { error: "Ese apodo ya está en uso. Prueba otro." };
    throw e;
  }
  revalidatePath("/ranking");
  return { ok: true };
}
