"use server";

import { refresh } from "next/cache";
import { refundOrder } from "@/lib/server/billing";
import { getCurrentUser } from "@/lib/server/session";

export interface RefundState {
  ok?: boolean;
  error?: string;
  /** Lo que se escribió, para no perderlo si hay error */
  values?: { amount: string; note: string; removeDays: boolean };
}

const MESSAGES = {
  "not-found": "No existe esa orden.",
  "not-paid": "Esa orden no está pagada o ya se reembolsó.",
  "bad-amount": "El monto debe ser mayor que 0 y no puede pasar de lo cobrado.",
} as const;

/** Registra un reembolso. Solo administradores. */
export async function refundAction(_prev: RefundState, form: FormData): Promise<RefundState> {
  const admin = await getCurrentUser();
  if (!admin?.isAdmin) return { error: "No autorizado." };

  const reference = String(form.get("reference") ?? "");
  const rawAmount = String(form.get("amount") ?? "");
  const amount = Number(rawAmount.replace(",", "."));
  const note = String(form.get("note") ?? "").trim().slice(0, 300);
  const removeDays = form.get("removeDays") === "si";
  const values = { amount: rawAmount, note, removeDays };
  if (form.get("confirm") !== "si") return { error: "Confirma que ya devolviste el dinero en Wompi.", values };

  const result = await refundOrder({ reference, amount, removeDays, note, by: admin.email });
  if (result !== "refunded") return { error: MESSAGES[result], values };

  console.info("[admin] reembolso registrado", { reference, amount, by: admin.email });
  refresh();
  return { ok: true };
}
