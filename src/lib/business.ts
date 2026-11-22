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

// ---------------------------------------------------------------------------------------------
// Rutas por área: el encargado asigna un área a cada persona y sus lecciones clave se desbloquean.
// ---------------------------------------------------------------------------------------------

export type AreaId = "finanzas" | "atencion" | "direccion" | "operaciones";

export const AREAS: Record<AreaId, { label: string; focus: string; lessons: string[] }> = {
  finanzas: {
    label: "Finanzas y pagos",
    focus: "Fraude del jefe, facturas con cuentas cambiadas y transferencias urgentes.",
    lessons: ["u7l1", "u7l2", "u1l3", "u4l3", "u8l3"],
  },
  atencion: {
    label: "Atención al cliente y ventas",
    focus: "Llamadas falsas, perfiles que suplantan a la empresa, remesas y soporte falso.",
    lessons: ["u4l3", "u5l2", "u4l1", "u7l3", "u2l1"],
  },
  direccion: {
    label: "Dirección y gerencia",
    focus: "Mensajes casi perfectos, voces clonadas, cuentas robadas y verificación en dos pasos.",
    lessons: ["u7l1", "u8l2", "u5l1", "u6l2", "u8l3"],
  },
  operaciones: {
    label: "Operaciones y personal general",
    focus: "Leer enlaces, archivos y QR, contraseñas y apps del celular.",
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

export function readinessLevel(score: number) {
  if (score >= 75) return { label: "Preparada", tone: "ok" as const };
  if (score >= 50) return { label: "En progreso", tone: "warn" as const };
  return { label: "En riesgo", tone: "bad" as const };
}

/** Recomendaciones concretas a partir de los puntos débiles (para el informe de gerencia). */
export function recommendations(x: ReadinessInput, weakestSkill: string | null, membersWithoutArea: number) {
  const out: string[] = [];
  if (x.pathPct === null || x.pathPct < 50)
    out.push("Pide que cada persona complete al menos una lección por semana de la ruta guiada.");
  if (x.clickRate === null) out.push("Envía un primer simulacro de phishing para medir cómo reacciona el equipo.");
  else if (x.clickRate > 20) out.push("Más de 1 de cada 5 personas cayó en un simulacro: repite uno al mes y comenta los resultados con el equipo.");
  if (x.reportRate !== null && x.reportRate < 30)
    out.push("Pocas personas reportan los correos sospechosos: recuérdales usar “Reportar phishing” en vez de solo borrarlos.");
  if (x.inboxScore === null) out.push("Pide al equipo que practique en la bandeja de entrenamiento: simula un día normal de correo.");
  else if (x.inboxScore < 70) out.push("El puntaje en la bandeja de entrenamiento es bajo: practiquen con una bandeja por semana.");
  if (weakestSkill) out.push(`Refuercen la señal que más se les escapa: “${weakestSkill}”.`);
  if (membersWithoutArea > 0)
    out.push(`Asigna un área a ${membersWithoutArea === 1 ? "1 persona" : `${membersWithoutArea} personas`} para abrir las lecciones clave de su puesto.`);
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
