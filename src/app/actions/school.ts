"use server";

import { MongoServerError, ObjectId } from "mongodb";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
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
  const user = await getCurrentUser();
  const code = normalizeClassCode(form.get("code"));
  if (!user) redirect(`/registro?next=${encodeURIComponent(`/clase${code ? `?codigo=${code}` : ""}`)}`);
  if (!code) return { error: "Revisa el código: son 6 letras y números." };
  if (form.get(CLASS_CONSENT_FIELD) !== "si") return { error: "Para unirte, marca la casilla de autorización." };

  const { classes, classMembers } = await collections();
  const cls = await classes.findOne({ code });
  if (!cls) return { error: "No encontramos una clase con ese código." };
  if (cls.teacherId.equals(user._id)) return { error: "Eres el docente de esta clase." };
  if ((await classMembers.countDocuments({ classId: cls._id })) >= SCHOOL.studentsPerClass)
    return { error: "La clase ya está llena. Avísale a tu docente." };
  if ((await classMembers.countDocuments({ userId: user._id })) >= SCHOOL.classesPerStudent)
    return { error: `Puedes estar en ${SCHOOL.classesPerStudent} clases como máximo.` };

  try {
    await classMembers.insertOne({ _id: new ObjectId(), classId: cls._id, userId: user._id, joinedAt: new Date() });
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
