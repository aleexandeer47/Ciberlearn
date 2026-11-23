// Plan Empresa: precios por puesto y plantillas de simulacros. Funciones puras (se prueban sin base de datos).

import type { Lang } from "./i18n";

type L = Record<Lang, string>;

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

/** Pro Familiar: un pago cubre a varias personas; quien paga ve el avance de su familia. */
export const FAMILY = {
  price: 49.99,
  seats: 5,
  days: 365,
} as const;

export type OrgKind = "empresa" | "familia";

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

const PHISH_ES: PhishTemplate[] = [
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
      "Las facturas reales llegan como factura electrónica (PDF) de un proveedor conocido, no como un enlace para “ver”.",
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
      `${org} otorgará un bono especial de fin de año. Para incluirle en la nómina, confirme su información antes del viernes.`,
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

const PHISH_EN: PhishTemplate[] = [
  {
    id: "buzon-lleno",
    title: "Mailbox full",
    difficulty: "Fácil",
    fromName: (org) => `IT Support · ${org}`,
    subject: () => "Action required: your mailbox has reached 98% capacity",
    body: (org, n) => [
      `Hi ${n},`,
      `Your ${org} mailbox is almost full. If you don't expand it within the next 24 hours, you'll stop receiving messages.`,
      "Sign in to expand your storage at no cost.",
    ],
    cta: "Expand my mailbox",
    signals: [
      "Urgency: “within the next 24 hours”.",
      "It asks you to sign in from a link instead of going in the usual way yourself.",
      "The sender claims to be IT, but the email doesn't come from the company's domain.",
    ],
  },
  {
    id: "factura",
    title: "Supplier invoice past due",
    difficulty: "Media",
    fromName: () => "Accounts receivable",
    subject: () => "Overdue invoice #F-20931 – avoid late fees",
    body: (org, n) => [
      `Dear ${n},`,
      `This is a reminder that invoice #F-20931 issued to ${org} was due 3 days ago. To avoid late fees, review the document and confirm payment today.`,
      "You can view the invoice at the link below.",
    ],
    cta: "View invoice",
    signals: [
      "An invoice you weren't expecting, from a sender with no company name.",
      "Pressure with late fees and deadlines.",
      "Real e-invoices arrive as a PDF from a supplier you know, not as a link to “view”.",
    ],
  },
  {
    id: "bono",
    title: "Bonus payment",
    difficulty: "Media",
    fromName: (org) => `Human Resources · ${org}`,
    subject: () => "Confirm your details to receive the year-end bonus",
    body: (org, n) => [
      `Hi ${n},`,
      `${org} will be paying a special year-end bonus. To include you in payroll, confirm your information before Friday.`,
      "If you don't confirm in time, the bonus will be paid in the next period.",
    ],
    cta: "Confirm my details",
    signals: [
      "It offers money in exchange for “confirming details” the company already has.",
      "A short deadline and a loss if you don't act.",
      "HR doesn't need you to re-enter your details through a link.",
    ],
  },
  {
    id: "documento",
    title: "Shared document",
    difficulty: "Difícil",
    fromName: (org) => `${org} (via Shared Documents)`,
    subject: (org) => `A file was shared with you: “Performance review 2026 – ${org}.pdf”`,
    body: (org, n) => [
      `Hi ${n},`,
      `${org} management shared a document with you: “Performance review 2026”.`,
      "The document will be available for 7 days.",
    ],
    cta: "Open document",
    signals: [
      "It plays on curiosity: a review about you that you weren't expecting.",
      "A real document service shows who shared it and from which account; here there's nobody specific.",
      "Before opening it, check with the person who supposedly shared it.",
    ],
  },
];

/** Plantillas en español (las que se guardan en las campañas: el id es el mismo en los dos idiomas). */
export const PHISH_TEMPLATES = PHISH_ES;
export const PHISH_BY_ID = new Map(PHISH_ES.map((t) => [t.id, t]));
const PHISH_BY_ID_EN = new Map(PHISH_EN.map((t) => [t.id, t]));
export const phishTemplates = (lang: Lang) => (lang === "en" ? PHISH_EN : PHISH_ES);
export const phishTemplate = (id: string, lang: Lang) => (lang === "en" ? PHISH_BY_ID_EN : PHISH_BY_ID).get(id);
export const DIFFICULTY_LABEL: Record<Lang, Record<PhishTemplate["difficulty"], string>> = {
  es: { Fácil: "Fácil", Media: "Media", Difícil: "Difícil" },
  en: { Fácil: "Easy", Media: "Medium", Difícil: "Hard" },
};

// ---------------------------------------------------------------------------------------------
// Rutas por área: el encargado asigna un área a cada persona y sus lecciones clave se desbloquean.
// ---------------------------------------------------------------------------------------------

export type AreaId = "finanzas" | "atencion" | "direccion" | "operaciones";

export const AREAS: Record<AreaId, { label: L; focus: L; lessons: string[] }> = {
  finanzas: {
    label: { es: "Finanzas y pagos", en: "Finance and payments" },
    focus: {
      es: "Fraude del jefe, facturas con cuentas cambiadas y transferencias urgentes.",
      en: "Boss fraud, invoices with swapped accounts and urgent transfers.",
    },
    lessons: ["u7l1", "u7l2", "u1l3", "u4l3", "u8l3"],
  },
  atencion: {
    label: { es: "Atención al cliente y ventas", en: "Customer service and sales" },
    focus: {
      es: "Llamadas falsas, perfiles que suplantan a la empresa, remesas y soporte falso.",
      en: "Fake calls, profiles impersonating the company, money transfers and fake support.",
    },
    lessons: ["u4l3", "u5l2", "u4l1", "u7l3", "u2l1"],
  },
  direccion: {
    label: { es: "Dirección y gerencia", en: "Leadership and management" },
    focus: {
      es: "Mensajes casi perfectos, voces clonadas, cuentas robadas y verificación en dos pasos.",
      en: "Almost perfect messages, cloned voices, stolen accounts and two-step verification.",
    },
    lessons: ["u7l1", "u8l2", "u5l1", "u6l2", "u8l3"],
  },
  operaciones: {
    label: { es: "Operaciones y personal general", en: "Operations and general staff" },
    focus: {
      es: "Leer enlaces, archivos y QR, contraseñas y apps del celular.",
      en: "Reading links, files and QR codes, passwords and phone apps.",
    },
    lessons: ["u3l1", "u3l2", "u6l1", "u6l3", "u2l2"],
  },
};

export const isAreaId = (v: unknown): v is AreaId => typeof v === "string" && v in AREAS;

// ---------------------------------------------------------------------------------------------
// Índice de preparación (0-100): cuánto está preparada la empresa contra el phishing.
// ---------------------------------------------------------------------------------------------

export interface ReadinessInput {
  /** Avance promedio de la ruta (0-100) */
  pathPct: number | null;
  /** Puntaje promedio en la bandeja de entrenamiento (0-100) */
  inboxScore: number | null;
  /** % de simulacros en los que hicieron clic (0-100) */
  clickRate: number | null;
  /** % de simulacros que reportaron (0-100) */
  reportRate: number | null;
}

const WEIGHTS = { pathPct: 0.3, inboxScore: 0.25, clickRate: 0.3, reportRate: 0.15 } as const;

/** Promedio ponderado; los datos que aún no existen se excluyen y su peso se reparte. */
export function readinessScore(x: ReadinessInput) {
  const parts: [number, number][] = [];
  if (x.pathPct !== null) parts.push([x.pathPct, WEIGHTS.pathPct]);
  if (x.inboxScore !== null) parts.push([x.inboxScore, WEIGHTS.inboxScore]);
  if (x.clickRate !== null) parts.push([100 - x.clickRate, WEIGHTS.clickRate]);
  if (x.reportRate !== null) parts.push([x.reportRate, WEIGHTS.reportRate]);
  if (!parts.length) return null;
  const w = parts.reduce((a, [, k]) => a + k, 0);
  return Math.round(parts.reduce((a, [v, k]) => a + Math.max(0, Math.min(100, v)) * k, 0) / w);
}

export function readinessLevel(score: number, lang: Lang = "es") {
  const en = lang === "en";
  if (score >= 75) return { label: en ? "Prepared" : "Preparada", tone: "ok" as const };
  if (score >= 50) return { label: en ? "In progress" : "En progreso", tone: "warn" as const };
  return { label: en ? "At risk" : "En riesgo", tone: "bad" as const };
}

/** Recomendaciones concretas a partir de los puntos débiles (para el informe de gerencia). */
export function recommendations(x: ReadinessInput, weakestSkill: string | null, membersWithoutArea: number, lang: Lang = "es") {
  const t = (es: string, en: string) => (lang === "en" ? en : es);
  const out: string[] = [];
  if (x.pathPct === null || x.pathPct < 50)
    out.push(t("Pide que cada persona complete al menos una lección por semana de la ruta guiada.", "Ask everyone to complete at least one guided-path lesson a week."));
  if (x.clickRate === null)
    out.push(t("Envía un primer simulacro de phishing para medir cómo reacciona el equipo.", "Send a first phishing drill to measure how the team reacts."));
  else if (x.clickRate > 20)
    out.push(
      t(
        "Más de 1 de cada 5 personas cayó en un simulacro: repite uno al mes y comenta los resultados con el equipo.",
        "More than 1 in 5 people fell for a drill: repeat one every month and go over the results with the team.",
      ),
    );
  if (x.reportRate !== null && x.reportRate < 30)
    out.push(
      t(
        "Pocas personas reportan los correos sospechosos: recuérdales usar “Reportar phishing” en vez de solo borrarlos.",
        "Few people report suspicious emails: remind them to use “Report phishing” instead of just deleting them.",
      ),
    );
  if (x.inboxScore === null)
    out.push(t("Pide al equipo que practique en la bandeja de entrenamiento: simula un día normal de correo.", "Ask the team to practice in the training inbox: it simulates a normal day of email."));
  else if (x.inboxScore < 70)
    out.push(t("El puntaje en la bandeja de entrenamiento es bajo: practiquen con una bandeja por semana.", "The training inbox score is low: practice with one inbox a week."));
  if (weakestSkill) out.push(t(`Refuercen la señal que más se les escapa: “${weakestSkill}”.`, `Work on the sign they miss most: “${weakestSkill}”.`));
  if (membersWithoutArea > 0)
    out.push(
      t(
        `Asigna un área a ${membersWithoutArea === 1 ? "1 persona" : `${membersWithoutArea} personas`} para abrir las lecciones clave de su puesto.`,
        `Assign a team to ${membersWithoutArea === 1 ? "1 person" : `${membersWithoutArea} people`} to unlock the key lessons for their role.`,
      ),
    );
  return out.slice(0, 5);
}

/** ¿El asunto que reporta un empleado corresponde al de un simulacro? (sin importar mayúsculas, tildes ni espacios) */
export function subjectMatches(reported: string, sent: string) {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const a = norm(reported);
  const b = norm(sent);
  if (a.length < 8 || !b) return false;
  return b.includes(a) || a.includes(b) || b.includes(a.slice(0, 24));
}

/** Porcentaje entero, 0 si no hay base. */
export const pct = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);
