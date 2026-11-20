import { failOrder, fulfillOrder } from "@/lib/server/billing";
import { env } from "@/lib/server/env";
import { isApproved, verifyWebhookSignature, type WompiWebhook } from "@/lib/server/payments/wompi-crypto";

// Wompi llama aquí cuando se completa un pago del enlace.
export async function POST(req: Request) {
  const raw = await req.text(); // el body crudo: la firma se calcula sobre él
  if (!verifyWebhookSignature(raw, req.headers.get("wompi_hash"), env.wompiApiSecret)) {
    return new Response("firma inválida", { status: 401 });
  }

  let event: WompiWebhook;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("json inválido", { status: 400 });
  }

  const reference = event.EnlacePago?.IdentificadorEnlaceComercio;
  const txId = event.IdTransaccion ?? "";
  if (!reference) return new Response("sin referencia", { status: 400 });

  const livemode = event.EsProductiva === true;
  if (env.isProd && !livemode && !env.wompiAllowTest) {
    // Un pago de prueba nunca activa Pro en producción.
    return Response.json({ ok: true, ignored: "test-transaction" });
  }

  if (!isApproved(event)) {
    await failOrder(reference, txId);
    return Response.json({ ok: true, status: "failed" });
  }

  const result = await fulfillOrder({ reference, amount: Number(event.Monto), txId, livemode });
  if (result === "not-found" || result === "amount-mismatch") {
    console.error("[wompi] webhook rechazado", { reference, result });
    return Response.json({ ok: false, result }, { status: 422 });
  }
  return Response.json({ ok: true, result });
}
