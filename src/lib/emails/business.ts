import type { PhishTemplate } from "@/lib/business";
import { SITE } from "@/lib/site";
import { escapeHtml } from "./escape";

const shell = (inner: string) => `<!doctype html><html lang="es"><body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;padding:32px">
${inner}
</table></td></tr></table></body></html>`;

const button = (href: string, label: string) =>
  `<tr><td style="padding:24px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:12px">${escapeHtml(label)}</a></td></tr>`;

/** Invitación para unirse a la empresa en Ciberlearn. */
export function inviteEmail({ org, inviter, link }: { org: string; inviter: string; link: string }) {
  const subject = `${inviter} te invita a entrenar con ${org} en ${SITE.name}`;
  const text = [
    `Hola:`,
    "",
    `${inviter} te invitó a unirte a ${org} en ${SITE.name}, la plataforma para aprender a detectar estafas digitales.`,
    `Con la invitación tienes el plan Pro sin costo mientras ${org} tenga su plan activo.`,
    "",
    "Únete aquí (crea tu cuenta o entra con la que ya tienes):",
    link,
    "",
    "Si no esperabas esta invitación, puedes ignorar este correo.",
  ].join("\n");
  const html = shell(`<tr><td style="font-size:20px;font-weight:bold;padding-bottom:16px">${escapeHtml(SITE.name)}</td></tr>
<tr><td style="font-size:16px;line-height:1.6">${escapeHtml(inviter)} te invitó a unirte a <strong>${escapeHtml(org)}</strong> en ${escapeHtml(SITE.name)}, la plataforma para aprender a detectar estafas digitales.<br><br>Tendrás el plan Pro sin costo mientras ${escapeHtml(org)} tenga su plan activo.</td></tr>
${button(link, "Unirme al equipo")}
<tr><td style="font-size:13px;line-height:1.6;color:#475569">Si el botón no funciona, copia esta dirección en tu navegador:<br><span style="word-break:break-all">${escapeHtml(link)}</span><br><br>Si no esperabas esta invitación, ignora este correo.</td></tr>`);
  return { subject, text, html };
}

/**
 * Correo de simulacro. Imita un phishing real, pero el enlace lleva a una página de aprendizaje
 * del propio Ciberlearn. Al pie lleva una marca discreta, como piden las buenas prácticas.
 */
export function simulationEmail({ t, org, name, link }: { t: PhishTemplate; org: string; name: string; link: string }) {
  const first = name.split(" ")[0] || "hola";
  const paragraphs = t.body(org, first);
  const subject = t.subject(org);
  const text = [...paragraphs, "", `${t.cta}: ${link}`, "", `Ref. ${SITE.name}-SIM`].join("\n");
  const html = shell(`${paragraphs
    .map((p) => `<tr><td style="font-size:15px;line-height:1.6;padding-bottom:12px">${escapeHtml(p)}</td></tr>`)
    .join("\n")}
${button(link, t.cta)}
<tr><td style="font-size:11px;color:#94a3b8">Ref. ${escapeHtml(SITE.name)}-SIM</td></tr>`);
  return { subject, text, html, fromName: t.fromName(org) };
}
