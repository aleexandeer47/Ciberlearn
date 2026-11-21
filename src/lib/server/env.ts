import "server-only";

function read(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Falta la variable de entorno ${name}`);
  return v;
}

const isProd = process.env.NODE_ENV === "production";

export const env = {
  isProd,
  mongoUri: read("MONGODB_URI", "mongodb://127.0.0.1:27017"),
  mongoDb: read("MONGODB_DB", "anzuelo"),
  appUrl: read("APP_URL", "http://localhost:3000").replace(/\/$/, ""),
  /** "mock" activa el pago simulado (solo fuera de producción) */
  paymentsMode: read("PAYMENTS_MODE", "mock") as "mock" | "wompi",
  wompiAppId: process.env.WOMPI_APP_ID ?? "",
  wompiApiSecret: process.env.WOMPI_API_SECRET ?? "",
  /** En producción se rechazan transacciones de prueba salvo que esto sea "true". */
  wompiAllowTest: process.env.WOMPI_ALLOW_TEST === "true",
  // Correo: MAILJET_API_KEY, MAILJET_SECRET_KEY (o RESEND_API_KEY) y EMAIL_FROM se leen
  // directamente en src/lib/server/email.ts en cada envío.
};
