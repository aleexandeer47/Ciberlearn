import { confirmFromRedirect, failOrder, fulfillOrder } from "@/lib/server/billing";
import { env } from "@/lib/server/env";
import { isApproved, verifyWebhookSignature, type WompiWebhook } from "@/lib/server/payments/wompi-crypto";

// Wompi llama aquí cuando se completa un pago del enlace.
// Los logs nunca incluyen el secreto ni datos de la tarjeta: solo referencia y resultado.
export async function POST(req: Request) {
  const raw = await req.text(); // el body crudo: la firma se calcula sobre él
  const hash = req.headers.get("wompi_hash");

  let event: WompiWebhook;
  try {
    event = JSON.parse(raw);
  } catch {
    console.warn("[wompi] webhook con JSON inválido");
    return new Response("json inválido", { status: 400 });
  }
  const reference = event.EnlacePago?.IdentificadorEnlaceComercio;
  const txId = event.IdTransaccion ?? "";
  if (!reference) {
    console.warn("[wompi] webhook sin referencia");
    return new Response("sin referencia", { status: 400 });
  }

  if (!verifyWebhookSignature(raw, hash, env.wompiApiSecret)) {
    // Sin firma válida no se confía en el contenido: se consulta la transacción a Wompi.
    console.warn("[wompi] firma no válida, se verifica con la API", { reference, hashPresente: !!hash });
    const result = await confirmFromRedirect({ reference, txId });
    console.info("[wompi] verificación por API", { reference, result });
    return result === "activated" || result === "already-paid"
      ? Response.json({ ok: true, result })
      : Response.json({ ok: false, result }, { status: 401 });
  }

  const livemode = event.EsProductiva === true;
  if (env.isProd && !livemode && !env.wompiAllowTest) {
    // Un pago de prueba nunca activa Pro en producción (salvo WOMPI_ALLOW_TEST=true).
    console.info("[wompi] transacción de prueba ignorada (WOMPI_ALLOW_TEST no es true)", { reference });
    return Response.json({ ok: true, ignored: "test-transaction" });
  }

  if (!isApproved(event)) {
    await failOrder(reference, txId);
    console.info("[wompi] pago no aprobado", { reference, resultado: event.ResultadoTransaccion });
    return Response.json({ ok: true, status: "failed" });
  }

  const result = await fulfillOrder({ reference, amount: Number(event.Monto), txId, livemode });
  console.info("[wompi] webhook procesado", { reference, result, livemode });
  if (result === "not-found" || result === "amount-mismatch" || result === "tx-used") {
    return Response.json({ ok: false, result }, { status: 422 });
  }
  return Response.json({ ok: true, result });
}
