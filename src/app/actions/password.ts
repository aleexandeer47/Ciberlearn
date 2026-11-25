"use server";

import { createHash, randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { resetPasswordEmail } from "@/lib/emails/resetPassword";
import { requestT } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";
import { emailConfigured, sendEmail } from "@/lib/server/email";
import { env } from "@/lib/server/env";
import { hashPassword } from "@/lib/server/password";
import { createSession } from "@/lib/server/session";

const TOKEN_MINUTES = 60;
const MAX_REQUESTS = 3; // por correo cada 15 minutos
/** Cambios de contraseña permitidos por usuario en 24 horas */
const PASSWORD_CHANGES = { perDay: 3, windowMs: 24 * 3600_000 } as const;
const changesToday = (dates: Date[] | undefined, now = Date.now()) => (dates ?? []).filter((d) => now - d.getTime() < PASSWORD_CHANGES.windowMs).length;
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export interface ForgotState {
  done?: boolean;
  error?: string;
  /** Solo en desarrollo y sin servicio de correo: el enlace para poder probar. */
  devLink?: string;
}

export async function requestPasswordReset(_prev: ForgotState, form: FormData): Promise<ForgotState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const { lang, t } = await requestT();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: t("Escribe el correo de tu cuenta.", "Enter your account email.") };

  const { users, passwordResets } = await collections();
  const user = await users.findOne({ email }, { projection: { name: 1, passwordChanges: 1 } });
  // La respuesta es la misma exista o no la cuenta: así no se puede averiguar quién está registrado.
  if (!user) return { done: true };
  // Ya cambió la contraseña 3 veces hoy: no se manda otro enlace (misma respuesta, sin revelar nada)
  if (changesToday(user.passwordChanges) >= PASSWORD_CHANGES.perDay) return { done: true };

  const recent = await passwordResets.countDocuments({ email, createdAt: { $gt: new Date(Date.now() - 15 * 60_000) } });
  if (recent >= MAX_REQUESTS) return { done: true };

  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await passwordResets.insertOne({
    _id: new ObjectId(),
    tokenHash: sha256(token),
    userId: user._id,
    email,
    createdAt: now,
    expiresAt: new Date(now.getTime() + TOKEN_MINUTES * 60_000),
    usedAt: null,
  });

  const link = `${env.appUrl}/restablecer?token=${token}`;
  const { sent } = await sendEmail({ to: email, ...resetPasswordEmail({ name: user.name, link, minutes: TOKEN_MINUTES, lang }) });
  return { done: true, devLink: !sent && !env.isProd && !emailConfigured() ? link : undefined };
}

export interface ResetState {
  error?: string;
}

export async function resetPassword(_prev: ResetState, form: FormData): Promise<ResetState> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const { t } = await requestT();
  if (password.length < 8) return { error: t("La contraseña debe tener al menos 8 caracteres.", "Your password must be at least 8 characters.") };
  if (password.length > 200) return { error: t("La contraseña es demasiado larga.", "That password is too long.") };
  if (password !== confirm) return { error: t("Las dos contraseñas no coinciden.", "The two passwords don't match.") };

  const { passwordResets, users, sessions } = await collections();
  const now = new Date();
  // Límite de cambios por día: se revisa ANTES de gastar el enlace
  const pending = await passwordResets.findOne({ tokenHash: sha256(token), usedAt: null, expiresAt: { $gt: now } }, { projection: { userId: 1 } });
  if (pending) {
    const owner = await users.findOne({ _id: pending.userId }, { projection: { passwordChanges: 1 } });
    if (changesToday(owner?.passwordChanges, now.getTime()) >= PASSWORD_CHANGES.perDay)
      return {
        error: t(
          `Ya cambiaste tu contraseña ${PASSWORD_CHANGES.perDay} veces en las últimas 24 horas. Por seguridad, espera un poco para volver a cambiarla.`,
          `You've already changed your password ${PASSWORD_CHANGES.perDay} times in the last 24 hours. For security, please wait a while before changing it again.`,
        ),
      };
  }
  // Atómico: el enlace solo se puede usar una vez aunque se envíe dos veces.
  const reset = await passwordResets.findOneAndUpdate(
    { tokenHash: sha256(token), usedAt: null, expiresAt: { $gt: now } },
    { $set: { usedAt: now } },
  );
  if (!reset) return { error: t("El enlace venció o ya se usó. Pide uno nuevo.", "The link expired or was already used. Ask for a new one.") };

  // Guarda la fecha del cambio (solo las últimas 5, alcanza para contar las de 24 horas)
  await users.updateOne(
    { _id: reset.userId },
    { $set: { passwordHash: await hashPassword(password) }, $push: { passwordChanges: { $each: [now], $slice: -5 } } },
  );
  // Cierra todas las sesiones abiertas e invalida los otros enlaces pendientes.
  await sessions.deleteMany({ userId: reset.userId });
  await passwordResets.updateMany({ userId: reset.userId, usedAt: null }, { $set: { usedAt: now } });

  await createSession(reset.userId);
  redirect("/progreso?clave=actualizada");
}
