// Firmas de Wompi El Salvador (https://docs.wompi.sv). Sin dependencias de Next
// para poder probarlas con vitest.
import { createHmac, timingSafeEqual } from "node:crypto";

const hmacHex = (secret: string, data: string) => createHmac("sha256", secret).update(data, "utf8").digest("hex");

function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a.toLowerCase(), "utf8");
  const y = Buffer.from(b.toLowerCase(), "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Webhook: header `wompi_hash` = HMAC-SHA256 en hex del body crudo, con el API
 * Secret como clave. Hay que usar el body exactamente como llegó.
 */
export function verifyWebhookSignature(rawBody: string, hash: string | null, apiSecret: string) {
  if (!hash || !apiSecret) return false;
  return safeEqualHex(hmacHex(apiSecret, rawBody), hash);
}

/**
 * Redirect de un enlace de pago: hash = HMAC-SHA256 de
 * identificadorEnlaceComercio + idTransaccion + idEnlace + monto (sin separador).
 * La documentación no aclara el separador ni el formato del monto: se usa solo
 * para mostrar el estado; el plan se activa únicamente con el webhook.
 */
export function verifyRedirectSignature(
  p: { identificadorEnlaceComercio: string; idTransaccion: string; idEnlace: string; monto: string; hash: string },
  apiSecret: string,
) {
  if (!p.hash || !apiSecret) return false;
  const data = `${p.identificadorEnlaceComercio}${p.idTransaccion}${p.idEnlace}${p.monto}`;
  return safeEqualHex(hmacHex(apiSecret, data), p.hash);
}

export interface WompiWebhook {
  IdTransaccion?: string;
  ResultadoTransaccion?: string;
  Monto?: number;
  EsProductiva?: boolean;
  EnlacePago?: { Id?: number; IdentificadorEnlaceComercio?: string };
}

export const isApproved = (w: WompiWebhook) => w.ResultadoTransaccion === "ExitosaAprobada";
