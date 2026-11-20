import "server-only";
import { env } from "./env";

export interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export const emailConfigured = () => !!(env.resendApiKey && env.emailFrom);

/**
 * Envía un correo con Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Para usar otro servicio, cambia solo el cuerpo de esta función.
 * Sin configurar, no envía nada: deja el contenido en la consola del servidor.
 */
export async function sendEmail(mail: Email): Promise<{ sent: boolean }> {
  if (!emailConfigured()) {
    console.info(`[email] (sin servicio configurado) Para: ${mail.to} | ${mail.subject}\n${mail.text}`);
    return { sent: false };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.resendApiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.emailFrom, to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text }),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[email] Resend respondió", res.status, await res.text());
    return { sent: false };
  }
  return { sent: true };
}
