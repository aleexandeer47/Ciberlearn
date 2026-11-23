import type { Lang } from "@/lib/i18n";
import type { Channel, SignalCategory } from "./types";

type Labels = Record<SignalCategory, { label: string; hint: string }>;

const LABELS: Record<Lang, Labels> = {
  es: {
    remitente: { label: "Remitente sospechoso", hint: "La dirección o el número no corresponde a quien dice ser." },
    urgencia: { label: "Urgencia o miedo", hint: "Te presionan para actuar ya, sin pensar." },
    enlace: { label: "Enlace engañoso", hint: "El texto dice una cosa y la dirección real es otra." },
    solicitud: { label: "Pide datos o dinero", hint: "Claves, códigos, documentos, tarjeta o transferencias." },
    suplantacion: { label: "Suplantación", hint: "Se hace pasar por alguien de confianza." },
    adjunto: { label: "Adjunto peligroso", hint: "Archivos comprimidos o ejecutables inesperados." },
    oferta: { label: "Demasiado bueno", hint: "Premios, devoluciones o ganancias fáciles." },
    contexto: { label: "No tiene sentido", hint: "No esperabas ese mensaje o el saludo es genérico." },
  },
  en: {
    remitente: { label: "Suspicious sender", hint: "The address or number doesn't match who they claim to be." },
    urgencia: { label: "Urgency or fear", hint: "They pressure you to act now, without thinking." },
    enlace: { label: "Deceptive link", hint: "The text says one thing and the real address is another." },
    solicitud: { label: "Asks for data or money", hint: "Passwords, codes, ID, card details or transfers." },
    suplantacion: { label: "Impersonation", hint: "Pretends to be someone you trust." },
    adjunto: { label: "Dangerous attachment", hint: "Unexpected compressed or executable files." },
    oferta: { label: "Too good to be true", hint: "Prizes, refunds or easy money." },
    contexto: { label: "Doesn't add up", hint: "You weren't expecting it or the greeting is generic." },
  },
};

export const categoryLabels = (lang: Lang) => LABELS[lang];
/** Orden fijo de las categorías. */
export const CATEGORIES = Object.keys(LABELS.es) as SignalCategory[];

const CHANNELS: Record<Lang, Record<Channel, string>> = {
  es: { email: "Correo", sms: "SMS", chat: "Chat" },
  en: { email: "Email", sms: "Text", chat: "Chat" },
};
export const channelLabels = (lang: Lang) => CHANNELS[lang];
