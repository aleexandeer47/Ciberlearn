"use server";

import { MongoServerError, ObjectId } from "mongodb";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requestT } from "@/lib/i18n-server";
import { CLASS_CONSENT_FIELD } from "@/lib/legal";
import { isValidClassName, newClassCode, normalizeClassCode, SCHOOL } from "@/lib/school";
import { recordClassConsent } from "@/lib/server/consent";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

/** El docente crea una clase. Gratis. */
export async function createClass(form: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect(`/registro?next=${encodeURIComponent("/clase")}`);
  const name = String(form.get("name") ?? "").trim().replace(/\s+/g, " ");
  if (!isValidClassName(name)) redirect("/clase?error=nombre");
  const { classes } = await collections();
  if ((await classes.countDocuments({ teacherId: user._id })) >= SCHOOL.classesPerTeacher) redirect("/clase?error=limite-clases");

  const _id = new ObjectId();
  let created = false;
  // Reintenta si el código al azar ya existe
  for (let i = 0; i < 5 && !created; i++) {
    try {
      await classes.insertOne({ _id, name, teacherId: user._id, code: newClassCode(), createdAt: new Date() });
      created = true;
    } catch (e) {
      if (!(e instanceof MongoServerError && e.code === 11000)) throw e;
    }
  }
  redirect(created ? `/clase/${_id.toHexString()}` : "/clase?error=intenta");
}

export interface JoinClassState {
  error?: string;
}

/** El estudiante se une con el código y autoriza al docente a ver su avance. */
export async function joinClass(_prev: JoinClassState, form: FormData): Promise<JoinClassState> {
  const [user, { t }] = await Promise.all([getCurrentUser(), requestT()]);
  const code = normalizeClassCode(form.get("code"));
  if (!user) redirect(`/registro?next=${encodeURIComponent(`/clase${code ? `?codigo=${code}` : ""}`)}`);
  if (!code) return { error: t("Revisa el código: son 6 letras y números.", "Check the code: it's 6 letters and numbers.") };
  if (form.get(CLASS_CONSENT_FIELD) !== "si") return { error: t("Para unirte, marca la casilla de autorización.", "To join, tick the authorization box.") };

  const { classes, classMembers } = await collections();
  const cls = await classes.findOne({ code });
  if (!cls) return { error: t("No encontramos una clase con ese código.", "We couldn't find a class with that code.") };
  if (cls.teacherId.equals(user._id)) return { error: t("Eres el docente de esta clase.", "You're the teacher of this class.") };
  if ((await classMembers.countDocuments({ classId: cls._id })) >= SCHOOL.studentsPerClass)
    return { error: t("La clase ya está llena. Avísale a tu docente.", "The class is full. Let your teacher know.") };
  if ((await classMembers.countDocuments({ userId: user._id })) >= SCHOOL.classesPerStudent)
    return { error: t(`Puedes estar en ${SCHOOL.classesPerStudent} clases como máximo.`, `You can be in up to ${SCHOOL.classesPerStudent} classes.`) };

  try {
    await classMembers.insertOne({ _id: new ObjectId(), classId: cls._id, userId: user._id, joinedAt: new Date(), profileConsent: true });
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) redirect("/clase?unido=1");
    throw e;
  }
  try {
    await recordClassConsent({ userId: user._id, email: user.email, classId: cls._id, className: cls.name });
  } catch (e) {
    // Sin prueba de la autorización no se queda dentro
    await classMembers.deleteOne({ classId: cls._id, userId: user._id });
    throw e;
  }
  redirect("/clase?unido=1");
}

/** Quien ya estaba en una clase autoriza que su docente vea su perfil completo (texto nuevo, se guarda). */
export async function allowClassProfile(form: FormData) {
  const user = await getCurrentUser();
  const id = String(form.get("classId") ?? "");
  if (!user || !ObjectId.isValid(id) || form.get(CLASS_CONSENT_FIELD) !== "si") return;
  const { classes, classMembers } = await collections();
  const cls = await classes.findOne({ _id: new ObjectId(id) }, { projection: { name: 1 } });
  const member = cls && (await classMembers.findOne({ classId: cls._id, userId: user._id }));
  if (!cls || !member) return;
  await recordClassConsent({ userId: user._id, email: user.email, classId: cls._id, className: cls.name });
  await classMembers.updateOne({ _id: member._id }, { $set: { profileConsent: true } });
  refresh();
}

export async function leaveClass(form: FormData) {
  const user = await getCurrentUser();
  const id = String(form.get("classId") ?? "");
  if (!user || !ObjectId.isValid(id)) return;
  const { classMembers } = await collections();
  await classMembers.deleteOne({ classId: new ObjectId(id), userId: user._id });
  refresh();
}

/** La clase del docente de la sesión, o null. */
async function ownClass(form: FormData) {
  const user = await getCurrentUser();
  const id = String(form.get("classId") ?? "");
  if (!user || !ObjectId.isValid(id)) return null;
  const { classes } = await collections();
  return classes.findOne({ _id: new ObjectId(id), teacherId: user._id });
}

export async function removeStudent(form: FormData) {
  const cls = await ownClass(form);
  const userId = String(form.get("userId") ?? "");
  if (!cls || !ObjectId.isValid(userId)) return;
  const { classMembers } = await collections();
  await classMembers.deleteOne({ classId: cls._id, userId: new ObjectId(userId) });
  refresh();
}

/** Cambia el código: el anterior deja de servir (los que ya están dentro se quedan). */
export async function rotateClassCode(form: FormData) {
  const cls = await ownClass(form);
  if (!cls) return;
  const { classes } = await collections();
  for (let i = 0; i < 5; i++) {
    try {
      await classes.updateOne({ _id: cls._id }, { $set: { code: newClassCode() } });
      break;
    } catch (e) {
      if (!(e instanceof MongoServerError && e.code === 11000)) throw e;
    }
  }
  refresh();
}

export async function deleteClass(form: FormData) {
  const cls = await ownClass(form);
  if (!cls) return;
  const { classes, classMembers } = await collections();
  await classMembers.deleteMany({ classId: cls._id });
  await classes.deleteOne({ _id: cls._id });
  redirect("/clase?borrada=1");
}
