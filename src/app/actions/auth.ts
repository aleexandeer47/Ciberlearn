"use server";

import { MongoServerError, ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { requestT } from "@/lib/i18n-server";
import { consentError, readConsent, recordConsents } from "@/lib/server/consent";
import { collections } from "@/lib/server/db";
import { DUMMY_HASH, hashPassword, verifyPassword } from "@/lib/server/password";
import { createSession, destroySession } from "@/lib/server/session";

export interface AuthState {
  error?: string;
  fields?: { name?: string; email?: string; terminos?: boolean; privacidad?: boolean };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_ATTEMPTS = 8; // por correo cada 15 minutos (TTL en login_attempts)

/** Solo rutas internas: evita redirecciones abiertas a otros sitios. */
function safeNext(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : "/progreso";
}

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

export async function signup(_prev: AuthState, form: FormData): Promise<AuthState> {
  const name = str(form.get("name")).slice(0, 60);
  const email = str(form.get("email")).toLowerCase();
  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  const consent = readConsent(form);
  const fields = { name, email, ...consent };
  const { lang, t } = await requestT();

  if (name.length < 2) return { error: t("Escribe tu nombre.", "Enter your name."), fields };
  if (!EMAIL_RE.test(email) || email.length > 254) return { error: t("Ese correo no parece válido.", "That email doesn't look valid."), fields };
  if (password.length < 8) return { error: t("La contraseña debe tener al menos 8 caracteres.", "Your password must be at least 8 characters."), fields };
  if (password.length > 200) return { error: t("La contraseña es demasiado larga.", "That password is too long."), fields };
  const missing = consentError(consent, lang);
  if (missing) return { error: missing, fields };

  const { users } = await collections();
  const _id = new ObjectId();
  try {
    await users.insertOne({
      _id,
      email,
      name,
      passwordHash: await hashPassword(password),
      createdAt: new Date(),
      proUntil: null,
    });
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000)
      return { error: t("Ya existe una cuenta con ese correo. ¿Quieres entrar?", "An account with that email already exists. Want to log in?"), fields };
    throw e;
  }
  try {
    await recordConsents({ userId: _id, email, source: "registro" });
  } catch (e) {
    // Sin prueba de la aceptación no se crea la cuenta.
    await users.deleteOne({ _id });
    throw e;
  }
  await createSession(_id);
  redirect(safeNext(form.get("next")));
}

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = str(form.get("email")).toLowerCase();
  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  const fields = { email };
  const { t } = await requestT();
  const { users, loginAttempts } = await collections();

  if ((await loginAttempts.countDocuments({ email })) >= MAX_ATTEMPTS)
    return { error: t("Demasiados intentos. Espera 15 minutos y vuelve a probar.", "Too many attempts. Wait 15 minutes and try again."), fields };

  const user = email ? await users.findOne({ email }) : null;
  // Se verifica igual con un hash falso para que el tiempo no revele si el correo existe.
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    await loginAttempts.insertOne({ _id: new ObjectId(), email, createdAt: new Date() });
    return { error: t("Correo o contraseña incorrectos.", "Wrong email or password."), fields };
  }

  await loginAttempts.deleteMany({ email });
  await createSession(user._id);
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
