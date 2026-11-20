"use server";

import { redirect } from "next/navigation";
import { isPlanId } from "@/lib/plans";
import { CheckoutError, failOrder, fulfillOrder, mockPaymentsEnabled, startCheckout } from "@/lib/server/billing";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export async function checkout(form: FormData) {
  const planId = form.get("plan");
  if (!isPlanId(planId)) redirect("/planes");
  const user = await getCurrentUser();
  if (!user) redirect(`/registro?next=${encodeURIComponent("/planes")}`);

  let url: string;
  try {
    url = await startCheckout(user._id, planId);
  } catch (e) {
    const msg = e instanceof CheckoutError ? e.message : "No pudimos iniciar el pago. Intenta de nuevo.";
    if (!(e instanceof CheckoutError)) console.error("[checkout]", e);
    redirect(`/planes?error=${encodeURIComponent(msg)}`);
  }
  redirect(url);
}

/** Solo en modo simulado y fuera de producción: aprueba o rechaza una orden propia. */
export async function mockPay(form: FormData) {
  if (!mockPaymentsEnabled()) redirect("/planes");
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  const ref = String(form.get("ref") ?? "");
  const outcome = form.get("outcome");
  const { orders } = await collections();
  const order = await orders.findOne({ reference: ref, userId: user._id, provider: "mock" });
  if (!order) redirect("/planes");

  if (outcome === "approve") {
    await fulfillOrder({ reference: ref, amount: order.amount, txId: `mock_${Date.now()}`, livemode: false });
  } else {
    await failOrder(ref, `mock_${Date.now()}`);
  }
  redirect(`/pago/resultado?ref=${ref}`);
}
