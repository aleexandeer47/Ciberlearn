"use server";

import { ObjectId } from "mongodb";
import { refresh } from "next/cache";
import { cleanReportText, isReportChannel, REPORT_LIMITS } from "@/lib/community";
import { requestT } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export interface ReportState {
  ok?: boolean;
  error?: string;
}

/** Un usuario reporta una estafa. Queda pendiente hasta que un administrador la revise. */
export async function submitReport(_prev: ReportState, form: FormData): Promise<ReportState> {
  const [user, { lang, t }] = await Promise.all([getCurrentUser(), requestT()]);
  if (!user) return { error: t("Entra a tu cuenta para reportar.", "Log in to report.") };
  if (form.get("sin_datos") !== "si")
    return { error: t("Confirma que quitaste tus datos personales del mensaje.", "Confirm that you removed your personal data from the message.") };

  const channel = form.get("channel");
  if (!isReportChannel(channel)) return { error: t("Elige por dónde te llegó.", "Choose where you got it.") };
  const sender = cleanReportText(form.get("sender"), REPORT_LIMITS.senderMax);
  const text = cleanReportText(form.get("text"), REPORT_LIMITS.textMax);
  if (text.length < REPORT_LIMITS.textMin) return { error: t("Copia el mensaje (al menos unas palabras).", "Paste the message (at least a few words).") };

  const { scamReports } = await collections();
  const recent = await scamReports.countDocuments({ userId: user._id, createdAt: { $gt: new Date(Date.now() - 864e5) } });
  if (recent >= REPORT_LIMITS.perDay)
    return { error: t(`Puedes enviar hasta ${REPORT_LIMITS.perDay} reportes por día.`, `You can send up to ${REPORT_LIMITS.perDay} reports a day.`) };

  await scamReports.insertOne({
    _id: new ObjectId(),
    userId: user._id,
    channel,
    sender,
    text,
    status: "pending",
    createdAt: new Date(),
    meToo: [],
    lang,
  });
  return { ok: true };
}

/** “A mí también me llegó”: cada persona cuenta una vez; volver a tocar lo quita. */
export async function toggleMeToo(form: FormData) {
  const user = await getCurrentUser();
  const id = String(form.get("id") ?? "");
  if (!user || !ObjectId.isValid(id)) return;
  const { scamReports } = await collections();
  const _id = new ObjectId(id);
  const r = await scamReports.updateOne({ _id, status: "approved", meToo: { $ne: user._id } }, { $addToSet: { meToo: user._id } });
  if (r.modifiedCount === 0) await scamReports.updateOne({ _id, status: "approved" }, { $pull: { meToo: user._id } });
  refresh();
}

/** Aprobar (con posibles correcciones para quitar datos personales) o rechazar. Solo administradores. */
export async function moderateReport(form: FormData) {
  const admin = await getCurrentUser();
  if (!admin?.isAdmin) return;
  const id = String(form.get("id") ?? "");
  const decision = form.get("decision");
  if (!ObjectId.isValid(id) || (decision !== "approve" && decision !== "reject")) return;
  const { scamReports } = await collections();
  const set: Record<string, unknown> = {
    status: decision === "approve" ? "approved" : "rejected",
    reviewedAt: new Date(),
    reviewedBy: admin.email,
  };
  if (decision === "approve") {
    const text = cleanReportText(form.get("text"), REPORT_LIMITS.textMax);
    if (text.length >= REPORT_LIMITS.textMin) set.text = text;
    set.sender = cleanReportText(form.get("sender"), REPORT_LIMITS.senderMax);
  }
  await scamReports.updateOne({ _id: new ObjectId(id), status: "pending" }, { $set: set });
  refresh();
}
