import "server-only";
import { randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { PLANS, type PlanId } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { collections } from "./db";
import { env } from "./env";
import type { OrderDoc } from "./models";
import { createPaymentLink, wompiConfigured } from "./payments/wompi";

export const mockPaymentsEnabled = () => env.paymentsMode === "mock" && !env.isProd;

export class CheckoutError extends Error {}

/** Crea la orden y devuelve la URL a la que hay que mandar a la persona. */
export async function startCheckout(userId: ObjectId, planId: PlanId): Promise<string> {
  const plan = PLANS[planId];
  const reference = `anz_${randomBytes(9).toString("hex")}`;
  const useMock = mockPaymentsEnabled();
  if (!useMock && !wompiConfigured()) throw new CheckoutError("Los pagos todavía no están configurados.");

  const { orders } = await collections();
  const order: OrderDoc = {
    _id: new ObjectId(),
    reference,
    userId,
    planId,
    amount: plan.price,
    days: plan.days,
    status: "pending",
    provider: useMock ? "mock" : "wompi",
    createdAt: new Date(),
  };
  await orders.insertOne(order);

  if (useMock) return `/pago/simulado?ref=${reference}`;

  const link = await createPaymentLink({
    reference,
    amount: plan.price,
    productName: `${SITE.name} ${plan.name}`,
    description: `Acceso Pro por ${plan.days} días`,
    redirectUrl: `${env.appUrl}/pago/resultado?ref=${reference}`,
    webhookUrl: `${env.appUrl}/api/wompi/webhook`,
  });
  await orders.updateOne({ _id: order._id }, { $set: { providerLinkId: String(link.idEnlace) } });
  return link.urlEnlace;
}

export type FulfillResult = "activated" | "already-paid" | "not-found" | "amount-mismatch";

/**
 * Marca la orden como pagada y extiende Pro. Idempotente: solo la primera
 * llamada sobre una orden pendiente suma días.
 */
export async function fulfillOrder(input: {
  reference: string;
  amount: number;
  txId: string;
  livemode: boolean;
}): Promise<FulfillResult> {
  const { orders, users } = await collections();
  const order = await orders.findOne({ reference: input.reference });
  if (!order) return "not-found";
  if (order.status === "paid") return "already-paid";
  if (Math.abs(order.amount - input.amount) > 0.001) return "amount-mismatch";

  const now = new Date();
  const claimed = await orders.findOneAndUpdate(
    { _id: order._id, status: "pending" },
    { $set: { status: "paid", paidAt: now, providerTxId: input.txId, livemode: input.livemode } },
  );
  if (!claimed) return "already-paid";

  // Atómico: proUntil = max(proUntil, ahora) + días
  await users.updateOne({ _id: order.userId }, [
    {
      $set: {
        proUntil: { $add: [{ $max: [{ $ifNull: ["$proUntil", now] }, now] }, order.days * 864e5] },
      },
    },
  ]);
  return "activated";
}

export async function failOrder(reference: string, txId: string) {
  const { orders } = await collections();
  await orders.updateOne({ reference, status: "pending" }, { $set: { status: "failed", providerTxId: txId } });
}
