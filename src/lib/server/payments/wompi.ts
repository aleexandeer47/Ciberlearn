import "server-only";
import { env } from "../env";

const TOKEN_URL = "https://id.wompi.sv/connect/token";
const API = "https://api.wompi.sv";

let cached: { token: string; expiresAt: number } | null = null;

async function getToken() {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      audience: "wompi_api",
      client_id: env.wompiAppId,
      client_secret: env.wompiApiSecret,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Wompi: no se pudo autenticar (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

export interface PaymentLink {
  idEnlace: number;
  urlEnlace: string;
  estaProductivo: boolean;
}

/** POST /EnlacePago: enlace de un solo pago exitoso. */
export async function createPaymentLink(input: {
  reference: string;
  amount: number;
  productName: string;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
}): Promise<PaymentLink> {
  const res = await fetch(`${API}/EnlacePago`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${await getToken()}` },
    body: JSON.stringify({
      identificadorEnlaceComercio: input.reference,
      monto: input.amount,
      nombreProducto: input.productName,
      formaPago: { permitirTarjetaCreditoDebido: true, permitirPagoConPuntoAgricola: false },
      infoProducto: { descripcionProducto: input.description },
      configuracion: {
        urlRedirect: input.redirectUrl,
        urlWebhook: input.webhookUrl,
        notificarTransaccionCliente: true,
      },
      limitesDeUso: { cantidadMaximaPagosExitosos: 1 },
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Wompi: no se pudo crear el enlace (${res.status}) ${await res.text()}`);
  return (await res.json()) as PaymentLink;
}

export const wompiConfigured = () => !!(env.wompiAppId && env.wompiApiSecret);
