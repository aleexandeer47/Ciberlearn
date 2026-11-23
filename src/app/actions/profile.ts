"use server";

import { MongoServerError } from "mongodb";
import { revalidatePath } from "next/cache";
import { requestT } from "@/lib/i18n-server";
import { isCountry, NICK_RE } from "@/lib/ranking";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export interface ProfileState {
  ok?: boolean;
  error?: string;
}

export async function updateProfile(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const [user, { t }] = await Promise.all([getCurrentUser(), requestT()]);
  if (!user) return { error: t("Inicia sesión para editar tu perfil.", "Log in to edit your profile.") };

  const nickname = String(form.get("nickname") ?? "").trim();
  const country = String(form.get("country") ?? "");
  const showInRanking = form.get("showInRanking") === "on";

  if (!NICK_RE.test(nickname))
    return {
      error: t(
        "El apodo debe tener de 3 a 20 letras, números, punto, guion o guion bajo.",
        "Your nickname must be 3 to 20 letters, numbers, dots, hyphens or underscores.",
      ),
    };
  if (!isCountry(country)) return { error: t("Elige un país de la lista.", "Choose a country from the list.") };

  const { users } = await collections();
  try {
    await users.updateOne(
      { _id: user._id },
      { $set: { nickname, nicknameLower: nickname.toLowerCase(), country, showInRanking } },
    );
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) return { error: t("Ese apodo ya está en uso. Prueba otro.", "That nickname is taken. Try another one.") };
    throw e;
  }
  revalidatePath("/ranking");
  return { ok: true };
}
