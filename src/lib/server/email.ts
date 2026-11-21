import "server-only";
import { parseFrom } from "@/lib/emails/from";

export interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
}

type Provider = "mailjet" | "resend" | null;

// Se lee process.env en cada envío (no al cargar el módulo) para tomar cambios del .env.
function provider(): Provider {
  const from = process.env.EMAIL_FROM ?? "";
  if (!parseFrom(from)) return null;
  if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) return "mailjet";
  if (process.env.RESEND_API_KEY) return "resend";
  return null;
}

export const emailConfigured = () => provider() !== null;

/**
 * Envía un correo con el servicio configurado:
 *  - Mailjet (MAILJET_API_KEY + MAILJET_SECRET_KEY) — https://dev.mailjet.com/docs/email-api/send-api-v31/send-basic-email
 *  - Resend (RESEND_API_KEY) — https://resend.com/docs/api-reference/emails/send-email
 * El remitente sale de EMAIL_FROM. Sin configurar, no envía nada y deja el contenido en la consola.
 */
export async function sendEmail(mail: Email): Promise<{ sent: boolean }> {
  const p = provider();
  if (!p) {
    console.info(`[email] (sin servicio configurado) Para: ${mail.to} | ${mail.subject}\n${mail.text}`);
    return { sent: false };
  }
  const from = parseFrom(process.env.EMAIL_FROM!)!;

  try {
    if (p === "mailjet") {
      const auth = Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`).toString("base64");
      const res = await fetch("https://api.mailjet.com/v3.1/send", {
        method: "POST",
        headers: { authorization: `Basic ${auth}`, "content-type": "application/json" },
        body: JSON.stringify({
          Messages: [
            {
              From: { Email: from.email, Name: from.name },
              To: [{ Email: mail.to }],
              Subject: mail.subject,
              TextPart: mail.text,
              HTMLPart: mail.html,
            },
          ],
        }),
        cache: "no-store",
      });
      const body = (await res.json().catch(() => null)) as { Messages?: { Status?: string; Errors?: unknown }[] } | null;
      const status = body?.Messages?.[0]?.Status;
      if (!res.ok || status !== "success") {
        console.error("[email] Mailjet respondió", res.status, JSON.stringify(body?.Messages?.[0] ?? body));
        return { sent: false };
      }
      return { sent: true };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: `${from.name} <${from.email}>`,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[email] Resend respondió", res.status, await res.text());
      return { sent: false };
    }
    return { sent: true };
  } catch (e) {
    console.error(`[email] no se pudo enviar con ${p}`, e);
    return { sent: false };
  }
}
