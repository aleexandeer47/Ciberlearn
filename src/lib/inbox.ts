/*
 * Bandeja de entrenamiento: un correo simulado con mensajes reales y trampas mezclados.
 * La persona decide qué hacer con cada uno: reportar, eliminar, marcar como seguro o abrir el enlace.
 * Todas las marcas, personas y dominios son ficticios. Las respuestas nunca se mandan al navegador antes de terminar.
 * Los textos en inglés están en inbox.en.ts (mismos ids; el veredicto no cambia).
 */

import type { Lang } from "./i18n";
import { INBOX_EN } from "./inbox.en";

export type InboxAction = "reportar" | "eliminar" | "seguro" | "abrir";
export const INBOX_ACTIONS: InboxAction[] = ["reportar", "eliminar", "seguro", "abrir"];

export interface InboxEmail {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  time: string;
  body: string[];
  link?: { text: string; url: string };
  attachment?: string;
  verdict: "phishing" | "legit";
  explain: string;
}

const m = (x: InboxEmail) => x;

export const INBOX_EMAILS: InboxEmail[] = [
  m({
    id: "b01", fromName: "Soporte TI", fromEmail: "soporte@grupoatlacatl-it.com", subject: "Su contraseña vence hoy", time: "8:02",
    body: ["Estimado colaborador:", "Su contraseña de correo vence hoy a las 5:00 p. m. Para conservar el acceso, actualícela ahora."],
    link: { text: "Mantener mi contraseña", url: "https://grupoatlacatl-it.com/renovar" },
    verdict: "phishing", explain: "El dominio grupoatlacatl-it.com no es el de la empresa (grupoatlacatl.com), y la urgencia busca que no lo revises.",
  }),
  m({
    id: "b02", fromName: "Andrea López", fromEmail: "andrea.lopez@grupoatlacatl.com", subject: "Agenda de la reunión del jueves", time: "8:15",
    body: ["Hola equipo:", "Les dejo los temas del jueves: cierre de mes, vacaciones y el nuevo proveedor de papelería. Nos vemos a las 10."],
    verdict: "legit", explain: "Compañera conocida, dominio correcto, tema esperado y sin pedir datos ni enlaces.",
  }),
  m({
    id: "b03", fromName: "Banco Izalco", fromEmail: "alertas@bancoizalco-seguridad.net", subject: "Movimiento inusual detectado", time: "8:40",
    body: ["Detectamos un intento de compra por $725.00.", "Si no fue usted, verifique su identidad para bloquear la tarjeta."],
    link: { text: "Verificar mi identidad", url: "https://bancoizalco-seguridad.net/verificar" },
    verdict: "phishing", explain: "El banco usa bancoizalco.com. Este dominio imita al banco para robar tu usuario y clave.",
  }),
  m({
    id: "b04", fromName: "Recursos Humanos", fromEmail: "rrhh@grupoatlacatl.com", subject: "Boleta de pago de noviembre", time: "9:05",
    body: ["Tu boleta de pago de noviembre ya está disponible en la intranet, sección Nómina.", "No la enviamos por correo por seguridad."],
    verdict: "legit", explain: "Viene del dominio de la empresa y te manda a la intranet que ya usas, sin enlaces ni adjuntos.",
  }),
  m({
    id: "b05", fromName: "Distribuidora Lempa", fromEmail: "cobros@distlempa.com", subject: "URGENTE: nueva cuenta para pagos", time: "9:30",
    body: ["Por auditoría cambiamos de banco. A partir de hoy, depositen a la cuenta 0099-1123-44.", "Favor no llamar, estamos en cierre."],
    verdict: "phishing", explain: "Aunque el dominio sea el del proveedor, su buzón pudo ser hackeado. Cambio de cuenta + urgencia + “no llamar” = confirma por teléfono.",
  }),
  m({
    id: "b06", fromName: "Documentos compartidos", fromEmail: "no-reply@docs-compartidos.app", subject: "Ricardo te compartió “Aumentos 2027.xlsx”", time: "10:12",
    body: ["Ricardo Méndez te compartió un archivo.", "Inicia sesión con tu correo de trabajo para verlo."],
    link: { text: "Abrir archivo", url: "https://docs-compartidos.app/login?f=aumentos" },
    verdict: "phishing", explain: "Juega con la curiosidad (aumentos) y te pide tu contraseña del trabajo en un sitio externo desconocido.",
  }),
  m({
    id: "b07", fromName: "EnvíaYa", fromEmail: "notificaciones@enviaya.com", subject: "Tu pedido EY-552910 está en camino", time: "10:30",
    body: ["Tu pedido llegará mañana entre 9 y 12.", "Puedes ver el seguimiento en tu cuenta."],
    link: { text: "Ver seguimiento", url: "https://enviaya.com/seguimiento/EY-552910" },
    verdict: "legit", explain: "Dominio oficial, enlace al mismo dominio y sin cobros: un aviso de envío normal.",
  }),
  m({
    id: "b08", fromName: "Gerencia General", fromEmail: "gerencia.atlacatl@gmail.com", subject: "Necesito un favor discreto", time: "11:02",
    body: ["¿Estás en la oficina? Necesito que compres 5 tarjetas de regalo de $100 para unos clientes.", "Mándame los códigos por foto. No lo comentes, es sorpresa."],
    verdict: "phishing", explain: "Correo personal que se hace pasar por gerencia, secreto y tarjetas de regalo: fraude del jefe.",
  }),
  m({
    id: "b09", fromName: "Mesa de ayuda", fromEmail: "mesadeayuda@grupoatlacatl.com", subject: "Ticket #4471 resuelto", time: "11:40",
    body: ["Hola, el ticket que abriste sobre la impresora del segundo piso quedó resuelto.", "Si el problema sigue, responde a este correo."],
    verdict: "legit", explain: "Responde a algo que tú pediste, desde el dominio interno y sin pedir claves.",
  }),
  m({
    id: "b10", fromName: "Facturación electrónica", fromEmail: "facturas@facturas-online.top", subject: "Factura pendiente de aceptación", time: "12:15",
    body: ["Tiene una factura electrónica pendiente.", "Descargue el archivo adjunto para revisarla."],
    attachment: "Factura_pendiente.html",
    verdict: "phishing", explain: "Las facturas electrónicas llegan en PDF (y a veces XML o JSON) de un proveedor conocido. Un .html adjunto puede mostrar una página falsa de inicio de sesión.",
  }),
  m({
    id: "b11", fromName: "Agencia Tributaria", fromEmail: "notificaciones@tributos.gob", subject: "Recordatorio: declaración mensual", time: "13:20",
    body: ["Te recordamos que el plazo para la declaración de IVA vence el día 10.", "Ingresa al portal como de costumbre."],
    verdict: "legit", explain: "Dominio oficial del gobierno, sin enlace para pagar ni pedir datos: solo un recordatorio.",
  }),
  m({
    id: "b12", fromName: "Seguridad de la cuenta", fromEmail: "security@micr0soft-login.com", subject: "Inicio de sesión bloqueado", time: "14:05",
    body: ["Bloqueamos un inicio de sesión desde Rusia.", "Si no fuiste tú, confirma tu cuenta en las próximas 2 horas."],
    link: { text: "Confirmar mi cuenta", url: "https://micr0soft-login.com/confirmar" },
    verdict: "phishing", explain: "El dominio usa un cero en lugar de una “o” y mete miedo con un plazo corto.",
  }),
  m({
    id: "b13", fromName: "Carlos Rivas", fromEmail: "carlos.rivas@grupoatlacatl.com", subject: "Fotos de la celebración 📸", time: "15:10",
    body: ["¡Qué buena celebración! Subí las fotos a la carpeta compartida del equipo en la intranet."],
    verdict: "legit", explain: "Compañero conocido, dominio correcto y te manda a un lugar interno, sin enlaces externos.",
  }),
  m({
    id: "b14", fromName: "Premios Súper La Ceiba", fromEmail: "premios@laceiba-regalos.shop", subject: "¡Ganaste una gift card de $250!", time: "16:00",
    body: ["Felicidades, fuiste seleccionado entre nuestros clientes.", "Solo paga $2.99 de envío para recibir tu tarjeta."],
    link: { text: "Reclamar mi premio", url: "https://laceiba-regalos.shop/reclamar" },
    verdict: "phishing", explain: "Premio que no buscaste y un cobro pequeño para robar los datos de tu tarjeta.",
  }),
];

export const INBOX_BY_ID = new Map(INBOX_EMAILS.map((e) => [e.id, e]));
export const INBOX_SIZE = 8;

/** Elige los correos de una sesión: siempre hay al menos 3 reales y 3 trampas. */
export function pickInbox(rand = Math.random, size = INBOX_SIZE) {
  const shuffle = <T,>(a: T[]) => {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  };
  const legit = shuffle(INBOX_EMAILS.filter((e) => e.verdict === "legit"));
  const phish = shuffle(INBOX_EMAILS.filter((e) => e.verdict === "phishing"));
  const nLegit = Math.min(legit.length, 3 + Math.floor(rand() * 2)); // 3 o 4 reales
  const chosen = [...legit.slice(0, nLegit), ...phish.slice(0, size - nLegit)];
  // Orden de llegada por hora, como en una bandeja real
  return chosen.sort((a, b) => a.time.localeCompare(b.time, "es", { numeric: true })).map((e) => e.id);
}

export type Outcome = "excelente" | "bien" | "error" | "cayo";

/** Puntos por acción: reportar una trampa es lo ideal; abrirla es caer; reportar un correo real es falso positivo. */
export function outcomeOf(verdict: "phishing" | "legit", action: InboxAction): Outcome {
  if (verdict === "phishing") return action === "reportar" ? "excelente" : action === "eliminar" ? "bien" : action === "abrir" ? "cayo" : "error";
  return action === "seguro" || action === "abrir" ? "excelente" : action === "eliminar" ? "bien" : "error";
}
const POINTS: Record<Outcome, number> = { excelente: 2, bien: 1, error: 0, cayo: 0 };

/** El correo con sus textos en el idioma pedido. */
export function localizeInbox(e: InboxEmail, lang: Lang): InboxEmail {
  if (lang !== "en") return e;
  const t = INBOX_EN[e.id];
  return t ? { ...e, ...t, link: e.link && t.linkText ? { text: t.linkText, url: t.linkUrl ?? e.link.url } : e.link } : e;
}

export function gradeInbox(ids: string[], actions: Record<string, InboxAction>, lang: Lang = "es") {
  const items = ids.flatMap((id) => {
    const found = INBOX_BY_ID.get(id);
    const e = found && localizeInbox(found, lang);
    const action = actions[id];
    if (!e || !action) return [];
    return [{ id, verdict: e.verdict, action, outcome: outcomeOf(e.verdict, action), explain: e.explain, subject: e.subject }];
  });
  const max = items.length * 2;
  const score = max ? Math.round((items.reduce((a, x) => a + POINTS[x.outcome], 0) / max) * 100) : 0;
  return {
    items,
    score,
    reported: items.filter((x) => x.verdict === "phishing" && x.action === "reportar").length,
    phishing: items.filter((x) => x.verdict === "phishing").length,
    clicked: items.filter((x) => x.outcome === "cayo").length,
    falsePositives: items.filter((x) => x.verdict === "legit" && x.action === "reportar").length,
  };
}

export type PublicInboxEmail = Omit<InboxEmail, "verdict" | "explain">;
export const publicInbox = ({ id, fromName, fromEmail, subject, time, body, link, attachment }: InboxEmail): PublicInboxEmail => ({
  id,
  fromName,
  fromEmail,
  subject,
  time,
  body,
  ...(link ? { link } : {}),
  ...(attachment ? { attachment } : {}),
});
