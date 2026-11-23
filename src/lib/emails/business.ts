import type { PhishTemplate } from "@/lib/business";
import type { Lang } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { escapeHtml } from "./escape";

const shell = (inner: string, lang: Lang = "es") => `<!doctype html><html lang="${lang}"><body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;padding:32px">
${inner}
</table></td></tr></table></body></html>`;

const button = (href: string, label: string) =>
  `<tr><td style="padding:24px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:12px">${escapeHtml(label)}</a></td></tr>`;

/** Invitación para unirse a la empresa (o familia). */
export function inviteEmail({ org, inviter, link, lang = "es" }: { org: string; inviter: string; link: string; lang?: Lang }) {
  if (lang === "en") return inviteEmailEn({ org, inviter, link });
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

function inviteEmailEn({ org, inviter, link }: { org: string; inviter: string; link: string }) {
  const subject = `${inviter} invited you to train with ${org} on ${SITE.name}`;
  const text = [
    "Hi,",
    "",
    `${inviter} invited you to join ${org} on ${SITE.name}, the platform for learning to spot online scams.`,
    `With this invitation you get Pro at no cost while ${org} keeps its plan active.`,
    "",
    "Join here (create an account or log in with the one you have):",
    link,
    "",
    "If you weren't expecting this invitation, you can ignore this email.",
  ].join("\n");
  const html = shell(
    `<tr><td style="font-size:20px;font-weight:bold;padding-bottom:16px">${escapeHtml(SITE.name)}</td></tr>
<tr><td style="font-size:16px;line-height:1.6">${escapeHtml(inviter)} invited you to join <strong>${escapeHtml(org)}</strong> on ${escapeHtml(SITE.name)}, the platform for learning to spot online scams.<br><br>You'll get Pro at no cost while ${escapeHtml(org)} keeps its plan active.</td></tr>
${button(link, "Join the team")}
<tr><td style="font-size:13px;line-height:1.6;color:#475569">If the button doesn't work, copy this address into your browser:<br><span style="word-break:break-all">${escapeHtml(link)}</span><br><br>If you weren't expecting this invitation, ignore this email.</td></tr>`,
    "en",
  );
  return { subject, text, html };
}

/**
 * Correo de simulacro. Imita un phishing real, pero el enlace lleva a una página de aprendizaje
 * del propio sitio. Al pie lleva una marca discreta, como piden las buenas prácticas.
 * La plantilla ya viene en el idioma de la campaña.
 */
export function simulationEmail({
  t,
  org,
  name,
  link,
  lang = "es",
}: {
  t: PhishTemplate;
  org: string;
  name: string;
  link: string;
  lang?: Lang;
}) {
  const first = name.split(" ")[0] || (lang === "en" ? "there" : "hola");
  const paragraphs = t.body(org, first);
  const subject = t.subject(org);
  const text = [...paragraphs, "", `${t.cta}: ${link}`, "", `Ref. ${SITE.name}-SIM`].join("\n");
  const html = shell(`${paragraphs
    .map((p) => `<tr><td style="font-size:15px;line-height:1.6;padding-bottom:12px">${escapeHtml(p)}</td></tr>`)
    .join("\n")}
${button(link, t.cta)}
<tr><td style="font-size:11px;color:#94a3b8">Ref. ${escapeHtml(SITE.name)}-SIM</td></tr>`, lang);
  return { subject, text, html, fromName: t.fromName(org) };
}
