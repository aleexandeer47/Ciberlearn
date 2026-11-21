// Plan Empresa: precios por puesto y plantillas de simulacros. Funciones puras (se prueban sin base de datos).

export const BUSINESS = {
  /** US$ por empleado al año */
  seatPrice: 24,
  minSeats: 5,
  maxSeats: 500,
  days: 365,
  /** Simulacros que una empresa puede lanzar por día */
  campaignsPerDay: 3,
  /** Invitaciones por correo por día */
  invitesPerDay: 300,
} as const;

const cents = (n: number) => Math.round(n * 100) / 100;

export function isValidSeats(n: number) {
  return Number.isInteger(n) && n >= BUSINESS.minSeats && n <= BUSINESS.maxSeats;
}

/** Precio de un año para `seats` empleados. */
export const yearPrice = (seats: number) => cents(seats * BUSINESS.seatPrice);

/** Días que le quedan al plan (redondeado hacia arriba); 0 si ya venció. */
export function daysLeft(paidUntil: Date | null | undefined, now = new Date()) {
  if (!paidUntil) return 0;
  return Math.max(0, Math.ceil((paidUntil.getTime() - now.getTime()) / 864e5));
}

/**
 * Precio de agregar puestos a un plan vigente: proporcional a los días que faltan.
 * Mínimo US$1 para que no haya cobros de centavos.
 */
export function addSeatsPrice(add: number, paidUntil: Date | null | undefined, now = new Date()) {
  const left = Math.min(daysLeft(paidUntil, now), BUSINESS.days);
  if (left === 0 || add < 1) return 0;
  return Math.max(1, Math.ceil(add * BUSINESS.seatPrice * (left / BUSINESS.days) * 100) / 100);
}

export const orgActive = (paidUntil: Date | null | undefined, now = new Date()) =>
  !!paidUntil && paidUntil.getTime() > now.getTime();

/** Correos válidos de un texto (separados por comas, espacios o saltos de línea), sin repetir. */
export function parseEmails(raw: string, max = 50) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const all = raw
    .split(/[\s,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const valid = [...new Set(all.filter((s) => re.test(s) && s.length <= 254))];
  return { valid: valid.slice(0, max), invalid: all.filter((s) => !re.test(s)), overLimit: valid.length > max };
}

// ---------------------------------------------------------------------------------------------
// Simulacros de phishing. Se envían solo a empleados que aceptaron recibirlos al unirse.
// Usan el nombre de la propia empresa (que contrató el servicio); nunca marcas de terceros.
// ---------------------------------------------------------------------------------------------

export interface PhishTemplate {
  id: string;
  title: string;
  difficulty: "Fácil" | "Media" | "Difícil";
  fromName: (org: string) => string;
  subject: (org: string) => string;
  /** Párrafos del correo */
  body: (org: string, firstName: string) => string[];
  cta: string;
  /** Lo que la persona debió notar (se muestra al caer) */
  signals: string[];
}

export const PHISH_TEMPLATES: PhishTemplate[] = [
  {
    id: "buzon-lleno",
    title: "Buzón de correo lleno",
    difficulty: "Fácil",
    fromName: (org) => `Soporte TI · ${org}`,
    subject: () => "Acción requerida: su buzón alcanzó el 98% de capacidad",
    body: (org, n) => [
      `Hola ${n},`,
      `Su buzón de correo de ${org} está casi lleno. Si no lo amplía en las próximas 24 horas, dejará de recibir mensajes.`,
      "Inicie sesión para ampliar su espacio sin costo.",
    ],
    cta: "Ampliar mi buzón",
    signals: [
      "Urgencia: “en las próximas 24 horas”.",
      "Te pide iniciar sesión desde un enlace en vez de entrar tú por la vía de siempre.",
      "El remitente dice ser de TI, pero el correo no viene del dominio de la empresa.",
    ],
  },
  {
    id: "factura",
    title: "Factura pendiente de un proveedor",
    difficulty: "Media",
    fromName: () => "Cuentas por cobrar",
    subject: () => "Factura vencida #F-20931 – evite recargos",
    body: (org, n) => [
      `Estimado/a ${n}:`,
      `Le recordamos que la factura #F-20931 a nombre de ${org} venció hace 3 días. Para evitar recargos, revise el documento y confirme el pago hoy.`,
      "Puede ver la factura en el siguiente enlace.",
    ],
    cta: "Ver factura",
    signals: [
      "Una factura que no esperabas, de un remitente sin nombre de empresa.",
      "Presión con recargos y plazos.",
      "Las facturas reales llegan como DTE (PDF/JSON) de un proveedor conocido, no como un enlace para “ver”.",
    ],
  },
  {
    id: "bono",
    title: "Bono o aguinaldo",
    difficulty: "Media",
    fromName: (org) => `Recursos Humanos · ${org}`,
    subject: () => "Confirme sus datos para recibir el bono de fin de año",
    body: (org, n) => [
      `Hola ${n},`,
      `${org} otorgará un bono especial de fin de año. Para incluirle en la planilla, confirme su información antes del viernes.`,
      "Si no confirma a tiempo, el bono se pagará hasta el próximo periodo.",
    ],
    cta: "Confirmar mis datos",
    signals: [
      "Te ofrece dinero a cambio de “confirmar datos” que la empresa ya tiene.",
      "Plazo corto y una pérdida si no actúas.",
      "Recursos Humanos no necesita que vuelvas a ingresar tus datos desde un enlace.",
    ],
  },
  {
    id: "documento",
    title: "Documento compartido",
    difficulty: "Difícil",
    fromName: (org) => `${org} (vía Documentos compartidos)`,
    subject: (org) => `Le compartieron “Evaluación de desempeño 2026 – ${org}.pdf”`,
    body: (org, n) => [
      `Hola ${n},`,
      `Gerencia de ${org} compartió contigo un documento: “Evaluación de desempeño 2026”.`,
      "El documento estará disponible por 7 días.",
    ],
    cta: "Abrir documento",
    signals: [
      "Juega con la curiosidad: una evaluación sobre ti que no esperabas.",
      "Un servicio de documentos real te muestra quién lo compartió y desde qué cuenta; aquí no hay nadie concreto.",
      "Antes de abrir, confirma con la persona que supuestamente lo compartió.",
    ],
  },
];

export const PHISH_BY_ID = new Map(PHISH_TEMPLATES.map((t) => [t.id, t]));

/** Porcentaje entero, 0 si no hay base. */
export const pct = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);
