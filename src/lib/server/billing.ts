import "server-only";
import { randomBytes } from "node:crypto";
import { MongoServerError, ObjectId } from "mongodb";
import { BUSINESS, FAMILY } from "@/lib/business";
import { requestLang } from "@/lib/i18n-server";
import { PLANS, type PlanId } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { collections } from "./db";
import { env } from "./env";
import type { OrderDoc } from "./models";
import { createPaymentLink, getTransaction, wompiConfigured } from "./payments/wompi";

export const mockPaymentsEnabled = () => env.paymentsMode === "mock" && !env.isProd;

export class CheckoutError extends Error {}

/** Se ejecuta con la referencia recién creada, antes de mandar a pagar (p. ej. guardar la aceptación). */
type OnOrder = (reference: string) => Promise<void>;

/** Crea una orden pendiente y su enlace de pago; devuelve la URL a la que hay que mandar a la persona. */
async function openOrder(
  // title/description en español (así quedan en el registro); `en`: lo que ve en Wompi quien compra en inglés
  input: Pick<OrderDoc, "userId" | "planId" | "amount" | "days" | "title" | "business"> & {
    description: string;
    en: { title: string; description: string };
  },
  onOrder?: OnOrder,
): Promise<string> {
  const reference = `anz_${randomBytes(9).toString("hex")}`;
  const useMock = mockPaymentsEnabled();
  const en = (await requestLang()) === "en";
  if (!useMock && !wompiConfigured())
    throw new CheckoutError(en ? "Payments aren't set up yet." : "Los pagos todavía no están configurados.");

  const { orders } = await collections();
  const order: OrderDoc = {
    _id: new ObjectId(),
    reference,
    userId: input.userId,
    planId: input.planId,
    amount: input.amount,
    days: input.days,
    title: input.title,
    ...(input.business ? { business: input.business } : {}),
    status: "pending",
    provider: useMock ? "mock" : "wompi",
    createdAt: new Date(),
  };
  await orders.insertOne(order);
  await onOrder?.(reference);

  if (useMock) return `/pago/simulado?ref=${reference}`;

  const link = await createPaymentLink({
    reference,
    amount: input.amount,
    productName: `${SITE.name} ${en ? input.en.title : input.title}`,
    description: en ? input.en.description : input.description,
    redirectUrl: `${env.appUrl}/pago/resultado?ref=${reference}`,
    webhookUrl: `${env.appUrl}/api/wompi/webhook`,
  });
  await orders.updateOne({ _id: order._id }, { $set: { providerLinkId: String(link.idEnlace) } });
  return link.urlEnlace;
}

/** Compra del plan Pro individual. */
export function startCheckout(userId: ObjectId, planId: PlanId, onOrder?: OnOrder): Promise<string> {
  const plan = PLANS[planId];
  return openOrder(
    {
      userId,
      planId,
      amount: plan.price,
      days: plan.days,
      title: plan.name,
      description: `Acceso Pro por ${plan.days} días`,
      en: { title: planId === "pro-anual" ? "Pro yearly" : "Pro monthly", description: `Pro access for ${plan.days} days` },
    },
    onOrder,
  );
}

/** Compra del plan Empresa: un año para N puestos ("renovar") o puestos extra hasta el vencimiento ("agregar"). */
export function startBusinessCheckout(
  userId: ObjectId,
  b: { orgId: ObjectId; orgName: string; action: "renovar" | "agregar"; seats: number; amount: number },
  onOrder?: OnOrder,
): Promise<string> {
  const renew = b.action === "renovar";
  return openOrder(
    {
      userId,
      planId: "empresa",
      amount: b.amount,
      days: renew ? BUSINESS.days : 0,
      title: renew ? `Empresa · ${b.seats} puestos por 1 año` : `Empresa · ${b.seats} puestos adicionales`,
      business: { orgId: b.orgId, action: b.action, seats: b.seats },
      description: renew
        ? `Plan Empresa para ${b.orgName}: ${b.seats} empleados por ${BUSINESS.days} días`
        : `${b.seats} puestos adicionales para ${b.orgName} hasta el vencimiento del plan`,
      en: {
        title: renew ? `Business · ${b.seats} seats for 1 year` : `Business · ${b.seats} extra seats`,
        description: renew
          ? `Business plan for ${b.orgName}: ${b.seats} employees for ${BUSINESS.days} days`
          : `${b.seats} extra seats for ${b.orgName} until the plan expires`,
      },
    },
    onOrder,
  );
}

/** Compra (o renovación) de Pro Familiar: un año para la familia, con puestos fijos. */
export function startFamilyCheckout(userId: ObjectId, f: { orgId: ObjectId; orgName: string }, onOrder?: OnOrder): Promise<string> {
  return openOrder(
    {
      userId,
      planId: "familia",
      amount: FAMILY.price,
      days: FAMILY.days,
      title: `Pro Familiar · ${FAMILY.seats} personas por 1 año`,
      business: { orgId: f.orgId, action: "renovar", seats: FAMILY.seats },
      description: `Pro Familiar para ${f.orgName}: hasta ${FAMILY.seats} personas por ${FAMILY.days} días`,
      en: {
        title: `Family plan · ${FAMILY.seats} people for 1 year`,
        description: `Family plan for ${f.orgName}: up to ${FAMILY.seats} people for ${FAMILY.days} days`,
      },
    },
    onOrder,
  );
}

export type FulfillResult = "activated" | "already-paid" | "not-found" | "amount-mismatch" | "tx-used";

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
  let claimed;
  try {
    // "failed" también se acepta: un intento rechazado seguido de uno aprobado en el
    // mismo enlace debe activar Pro.
    claimed = await orders.findOneAndUpdate(
      { _id: order._id, status: { $in: ["pending", "failed"] } },
      { $set: { status: "paid", paidAt: now, providerTxId: input.txId, livemode: input.livemode } },
    );
  } catch (e) {
    // Índice único en providerTxId: esa transacción ya pagó otra orden.
    if (e instanceof MongoServerError && e.code === 11000) return "tx-used";
    throw e;
  }
  if (!claimed) return "already-paid";

  if (order.business) {
    const { orgs } = await collections();
    const b = order.business;
    if (b.action === "renovar") {
      // Atómico: paidUntil = max(paidUntil, ahora) + días, con los puestos comprados
      await orgs.updateOne({ _id: b.orgId }, [
        {
          $set: {
            paidUntil: { $add: [{ $max: [{ $ifNull: ["$paidUntil", now] }, now] }, order.days * 864e5] },
            seats: b.seats,
          },
        },
      ]);
    } else {
      await orgs.updateOne({ _id: b.orgId }, { $inc: { seats: b.seats } });
    }
    return "activated";
  }

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
  // El id del intento rechazado se guarda aparte: providerTxId queda libre para el pago aprobado.
  await orders.updateOne({ reference, status: "pending" }, { $set: { status: "failed", failedTxId: txId } });
}

export type RefundResult = "refunded" | "not-found" | "not-paid" | "bad-amount";

/**
 * Registra el reembolso de una orden pagada y, si se pide, quita sus días de Pro.
 * No mueve dinero: la devolución se hace en el panel de Wompi. Idempotente: una orden se reembolsa una sola vez.
 */
export async function refundOrder(input: {
  reference: string;
  amount: number;
  removeDays: boolean;
  note: string;
  by: string;
}): Promise<RefundResult> {
  const { orders, users } = await collections();
  const order = await orders.findOne({ reference: input.reference });
  if (!order) return "not-found";
  if (order.status !== "paid") return "not-paid";
  if (!(input.amount > 0) || input.amount - order.amount > 0.001) return "bad-amount";

  const now = new Date();
  const removedDays = input.removeDays ? order.days : 0;
  const removedSeats = input.removeDays && order.business?.action === "agregar" ? order.business.seats : 0;
  const claimed = await orders.findOneAndUpdate(
    { _id: order._id, status: "paid" },
    {
      $set: {
        status: "refunded",
        refund: {
          amount: Math.round(input.amount * 100) / 100,
          removedDays,
          ...(removedSeats ? { removedSeats } : {}),
          note: input.note,
          at: now,
          by: input.by,
        },
      },
    },
  );
  if (!claimed) return "not-paid";

  if (input.removeDays && order.business) {
    // Plan Empresa: se quita lo que compró esa orden (el año o los puestos extra)
    const { orgs } = await collections();
    const b = order.business;
    if (b.action === "renovar") {
      const until = { $subtract: ["$paidUntil", order.days * 864e5] };
      await orgs.updateOne({ _id: b.orgId, paidUntil: { $ne: null } }, [
        { $set: { paidUntil: { $cond: [{ $gt: [until, now] }, until, null] } } },
      ]);
    } else {
      await orgs.updateOne({ _id: b.orgId }, [{ $set: { seats: { $max: [1, { $subtract: ["$seats", b.seats] }] } } }]);
    }
  } else if (removedDays) {
    // Atómico: proUntil - días; si ya no queda tiempo, vuelve al plan gratis.
    const until = { $subtract: ["$proUntil", removedDays * 864e5] };
    await users.updateOne({ _id: order.userId, proUntil: { $ne: null } }, [
      { $set: { proUntil: { $cond: [{ $gt: [until, now] }, until, null] } } },
    ]);
  }
  return "refunded";
}

export type ConfirmResult = FulfillResult | "not-approved" | "test-ignored" | "unavailable";

/**
 * Respaldo del webhook: al volver de Wompi, confirma el pago consultando la transacción
 * directamente en la API de Wompi. Solo activa la orden propia, pendiente, de Wompi, con
 * transacción aprobada, del monto correcto, posterior a la orden y no usada en otra orden.
 */
export async function confirmFromRedirect(input: { reference: string; txId: string; userId?: ObjectId }): Promise<ConfirmResult> {
  const { orders } = await collections();
  // Con userId (página de resultado) solo puede confirmar sus propias órdenes.
  const order = await orders.findOne({
    reference: input.reference,
    provider: "wompi",
    ...(input.userId ? { userId: input.userId } : {}),
  });
  if (!order) return "not-found";
  if (order.status === "paid") return "already-paid";
  if (!wompiConfigured() || !/^[0-9a-f-]{20,64}$/i.test(input.txId)) return "unavailable";

  let tx;
  try {
    tx = await getTransaction(input.txId);
  } catch (e) {
    console.error("[wompi] no se pudo consultar la transacción", { reference: input.reference }, e);
    return "unavailable";
  }
  if (!tx || tx.esAprobada !== true) return "not-approved";
  if (env.isProd && tx.esReal !== true && !env.wompiAllowTest) return "test-ignored";
  if (tx.fechaTransaccion && new Date(tx.fechaTransaccion).getTime() < order.createdAt.getTime() - 5 * 60_000) {
    return "not-approved"; // la transacción es anterior a esta orden
  }
  const amount = Number(tx.montoOriginal ?? tx.monto);
  return fulfillOrder({ reference: order.reference, amount, txId: input.txId, livemode: tx.esReal === true });
}
