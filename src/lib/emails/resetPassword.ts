import type { Lang } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { escapeHtml } from "./escape";

/** Correo de recuperación. Sin imágenes ni estilos externos para que llegue bien a cualquier bandeja. */
export function resetPasswordEmail({
  name,
  link,
  minutes,
  lang = "es",
}: {
  name: string;
  link: string;
  minutes: number;
  lang?: Lang;
}) {
  const en = lang === "en";
  const first = name.split(" ")[0] || (en ? "there" : "hola");
  const c = en
    ? {
        subject: `Reset your ${SITE.name} password`,
        hi: `Hi ${first},`,
        asked: `We received a request to change the password for your ${SITE.name} account.`,
        open: `Open this link to choose a new one (it expires in ${minutes} minutes):`,
        htmlAsked: `We received a request to change your account password. The link expires in ${minutes} minutes.`,
        button: "Choose a new password",
        copy: "If the button doesn't work, copy this address into your browser:",
        notYou: "If it wasn't you, ignore this email: your current password still works.",
        never: "We will never ask for your password by email, text or chat.",
      }
    : {
        subject: `Restablece tu contraseña de ${SITE.name}`,
        hi: `Hola, ${first}:`,
        asked: `Recibimos una solicitud para cambiar la contraseña de tu cuenta de ${SITE.name}.`,
        open: `Abre este enlace para elegir una nueva (vence en ${minutes} minutos):`,
        htmlAsked: `Recibimos una solicitud para cambiar la contraseña de tu cuenta. El enlace vence en ${minutes} minutos.`,
        button: "Elegir nueva contraseña",
        copy: "Si el botón no funciona, copia esta dirección en tu navegador:",
        notYou: "Si no fuiste tú, ignora este correo: tu contraseña actual sigue funcionando.",
        never: "Nunca te pediremos tu contraseña por correo, SMS ni chat.",
      };

  const text = [c.hi, "", c.asked, c.open, link, "", c.notYou, c.never].join("\n");

  const html = `<!doctype html><html lang="${lang}"><body style="margin:0;background:#f7f3ea;font-family:Arial,Helvetica,sans-serif;color:#121a26">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td style="font-size:20px;font-weight:bold;padding-bottom:16px">${escapeHtml(SITE.name)}</td></tr>
<tr><td style="font-size:16px;line-height:1.6">${escapeHtml(c.hi)}<br><br>${escapeHtml(c.htmlAsked)}</td></tr>
<tr><td style="padding:24px 0"><a href="${escapeHtml(link)}" style="display:inline-block;background:#ff5b36;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:999px">${escapeHtml(c.button)}</a></td></tr>
<tr><td style="font-size:13px;line-height:1.6;color:#4a5462">${escapeHtml(c.copy)}<br><span style="word-break:break-all">${escapeHtml(link)}</span><br><br>${escapeHtml(c.notYou)} ${escapeHtml(c.never)}</td></tr>
</table></td></tr></table></body></html>`;

  return { subject: c.subject, text, html };
}
