import type { Channel, SignalCategory } from "./types";

export const CATEGORY_LABELS: Record<SignalCategory, { label: string; hint: string }> = {
  remitente: { label: "Remitente sospechoso", hint: "La dirección o el número no corresponde a quien dice ser." },
  urgencia: { label: "Urgencia o miedo", hint: "Te presionan para actuar ya, sin pensar." },
  enlace: { label: "Enlace engañoso", hint: "El texto dice una cosa y la dirección real es otra." },
  solicitud: { label: "Pide datos o dinero", hint: "Claves, códigos, DUI, tarjeta o transferencias." },
  suplantacion: { label: "Suplantación", hint: "Se hace pasar por alguien de confianza." },
  adjunto: { label: "Adjunto peligroso", hint: "Archivos comprimidos o ejecutables inesperados." },
  oferta: { label: "Demasiado bueno", hint: "Premios, devoluciones o ganancias fáciles." },
  contexto: { label: "No tiene sentido", hint: "No esperabas ese mensaje o el saludo es genérico." },
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  email: "Correo",
  sms: "SMS",
  chat: "Chat",
};
