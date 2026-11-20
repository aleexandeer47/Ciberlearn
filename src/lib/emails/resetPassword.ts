import { SITE } from "@/lib/site";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Correo de recuperación. Sin imágenes ni estilos externos para que llegue bien a cualquier bandeja. */
export function resetPasswordEmail({ name, link, minutes }: { name: string; link: string; minutes: number }) {
  const first = name.split(" ")[0] || "hola";
  const subject = `Restablece tu contraseña de ${SITE.name}`;
  const text = [
    `Hola, ${first}:`,
    "",
    `Recibimos una solicitud para cambiar la contraseña de tu cuenta de ${SITE.name}.`,
    `Abre este enlace para elegir una nueva (vence en ${minutes} minutos):`,
    link,
    "",
    "Si no fuiste tú, ignora este correo: tu contraseña actual sigue funcionando.",
    `Nunca te pediremos tu contraseña por correo, SMS ni chat.`,
  ].join("\n");

  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f7f3ea;font-family:Arial,Helvetica,sans-serif;color:#121a26">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td style="font-size:20px;font-weight:bold;padding-bottom:16px">${escapeHtml(SITE.name)}</td></tr>
<tr><td style="font-size:16px;line-height:1.6">Hola, ${escapeHtml(first)}:<br><br>Recibimos una solicitud para cambiar la contraseña de tu cuenta. El enlace vence en ${minutes} minutos.</td></tr>
<tr><td style="padding:24px 0"><a href="${escapeHtml(link)}" style="display:inline-block;background:#ff5b36;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:999px">Elegir nueva contraseña</a></td></tr>
<tr><td style="font-size:13px;line-height:1.6;color:#4a5462">Si el botón no funciona, copia esta dirección en tu navegador:<br><span style="word-break:break-all">${escapeHtml(link)}</span><br><br>Si no fuiste tú, ignora este correo: tu contraseña actual sigue funcionando. Nunca te pediremos tu contraseña por correo, SMS ni chat.</td></tr>
</table></td></tr></table></body></html>`;

  return { subject, text, html };
}
