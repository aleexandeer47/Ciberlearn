import type { ObjectId } from "mongodb";
import type { AreaId, OrgKind } from "@/lib/business";
import type { PlanId } from "@/lib/plans";
import type { SignalCategory, Verdict } from "@/lib/scenarios/types";

export interface UserDoc {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  /** Fin del periodo Pro pagado. null = plan gratis. */
  proUntil: Date | null;
  /** Solo se asigna con `npm run admin -- correo`; nunca desde la web. */
  role?: "admin";
  lastLoginAt?: Date;
  /** XP total (ruta + simulador + chats con IA). Lo usa el ranking. */
  xp?: number;
  /** Vidas de la ruta; la regeneración se calcula al leer (src/lib/lives.ts). */
  lives?: { count: number; updatedAt: Date };
  path?: { completed: string[] };
  /** Perfil público del ranking: nunca se muestran nombre real ni correo. */
  nickname?: string;
  nicknameLower?: string;
  country?: string;
  showInRanking?: boolean;
  /** Empresa a la que pertenece (plan Empresa). Una persona solo puede estar en una. */
  orgId?: ObjectId;
  orgRole?: "owner" | "member";
  orgJoinedAt?: Date;
  /** Área asignada por el encargado: desbloquea sus lecciones clave */
  orgArea?: AreaId;
  /** Estafa del día: racha de días seguidos respondiendo */
  daily?: { lastDay: string; streak: number; best: number };
  /** Identificador público de la tarjeta de logro (/logro/…); solo se crea si la persona la comparte */
  shareId?: string;
  /** Certificado emitido (Pro): código público para verificarlo en /verificar/… */
  certificate?: { code: string; issuedAt: Date; bestScore: number; level: string; messages: number };
}

/** Reto entre amigos: 5 mensajes fijos que juega quien lo crea y quien reciba el enlace. */
export interface ChallengeDoc {
  _id: ObjectId;
  code: string;
  creatorId: ObjectId;
  /** Apodo público de quien lo creó (nunca su nombre real) */
  creatorName: string;
  exerciseIds: string[];
  /** null hasta que quien lo creó lo juegue */
  creatorScore: number | null;
  plays: number;
  createdAt: Date;
}

export interface ChallengePlayDoc {
  _id: ObjectId;
  challengeId: ObjectId;
  /** Nombre que la persona escribió para la tabla del reto */
  name: string;
  userId?: ObjectId;
  score: number;
  createdAt: Date;
}

/** Respuesta a la estafa del día (una por persona y día). */
export interface DailyAnswerDoc {
  _id: ObjectId;
  userId: ObjectId;
  day: string;
  caseId: string;
  correct: boolean;
  createdAt: Date;
}

/** Estafa reportada por un usuario. Solo se publica después de que un administrador la aprueba. */
export interface ScamReportDoc {
  _id: ObjectId;
  userId: ObjectId;
  channel: "SMS" | "WhatsApp" | "Correo" | "Llamada" | "Redes sociales" | "Otro";
  /** Número, correo, perfil o enlace desde donde llegó */
  sender: string;
  text: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  /** Personas que dicen que también les llegó */
  meToo: ObjectId[];
  /** Idioma en que se reportó (los antiguos no lo tienen: español) */
  lang?: "es" | "en";
  /** Alerta con un mensaje de EJEMPLO (reconstruido de un aviso oficial), no el texto real recibido. Se puede ocultar en /alertas. */
  example?: boolean;
}

/** Empresa con plan Empresa. El encargado (owner) también ocupa un puesto. */
export interface OrgDoc {
  _id: ObjectId;
  /** "familia" = Pro Familiar (sin simulacros ni áreas). Sin valor = empresa. */
  kind?: OrgKind;
  name: string;
  ownerId: ObjectId;
  /** Puestos pagados */
  seats: number;
  /** Personas dentro (incluye al encargado). Se actualiza de forma atómica al entrar o salir. */
  memberCount: number;
  /** Fin del periodo pagado. null = aún no paga. */
  paidUntil: Date | null;
  /** Código del enlace de invitación; se puede cambiar para invalidar el anterior. */
  inviteCode: string;
  /** Invitaciones por correo enviadas hoy (límite diario) */
  invites?: { day: string; count: number };
  createdAt: Date;
}

/** Un simulacro de phishing enviado a los empleados de una empresa. */
export interface PhishCampaignDoc {
  /** Idioma en que se envió (los antiguos: español) */
  lang?: "es" | "en";
  _id: ObjectId;
  orgId: ObjectId;
  templateId: string;
  createdBy: ObjectId;
  createdAt: Date;
  day: string;
  targets: number;
  sent: number;
}

/** Un correo de simulacro enviado a una persona. El token del enlace solo se guarda como hash. */
export interface PhishTargetDoc {
  _id: ObjectId;
  campaignId: ObjectId;
  orgId: ObjectId;
  userId: ObjectId;
  email: string;
  tokenHash: string;
  sentAt: Date | null;
  /** Abrió el enlace del simulacro */
  clickedAt?: Date;
  /** Lo reportó como sospechoso desde la página de su empresa */
  reportedAt?: Date;
}

/** Clase de un docente (modo colegio, gratis). */
export interface ClassDoc {
  _id: ObjectId;
  name: string;
  teacherId: ObjectId;
  /** Código de 6 caracteres para unirse (src/lib/school.ts) */
  code: string;
  createdAt: Date;
}

export interface ClassMemberDoc {
  _id: ObjectId;
  classId: ObjectId;
  userId: ObjectId;
  joinedAt: Date;
}

/** Correo sospechoso que un empleado reportó y que no era un simulacro: le llega al encargado. */
export interface OrgReportDoc {
  _id: ObjectId;
  orgId: ObjectId;
  userId: ObjectId;
  subject: string;
  sender: string;
  notes: string;
  createdAt: Date;
}

/** Índice de preparación de una empresa por mes (para ver su evolución). */
export interface OrgScoreDoc {
  _id: string; // `${orgId}:${AAAA-MM}`
  orgId: ObjectId;
  month: string;
  score: number;
  updatedAt: Date;
}

/** Sesión de la bandeja de entrenamiento (de un solo uso: se borra al terminar). */
export interface InboxSessionDoc {
  _id: ObjectId;
  userId: ObjectId;
  emailIds: string[];
  createdAt: Date;
}

export interface InboxResultDoc {
  _id: ObjectId;
  userId: ObjectId;
  orgId?: ObjectId;
  score: number;
  reported: number;
  phishing: number;
  clicked: number;
  falsePositives: number;
  createdAt: Date;
}

/**
 * Registro de aceptación de un documento legal (solo se agregan, nunca se editan).
 * Sirve para demostrar cuándo, cómo y qué versión aceptó cada persona.
 */
export interface ConsentDoc {
  _id: ObjectId;
  userId: ObjectId;
  /** Correo de la cuenta en el momento de aceptar */
  email: string;
  /** "empresa": autorización a una empresa o familia; "clase": autorización al docente de una clase */
  document: "terminos" | "privacidad" | "empresa" | "clase";
  /** Versión del documento aceptado (src/lib/legal.ts) */
  version: string;
  /** Texto exacto de la casilla que se marcó */
  text: string;
  /** Formulario donde se aceptó */
  source: "registro" | "compra" | "unirse-empresa" | "unirse-clase";
  /** Referencia de la orden si se aceptó al comprar */
  orderRef?: string;
  /** Empresa a la que se unió (document "empresa") */
  orgId?: ObjectId;
  /** Clase a la que se unió (document "clase") */
  classId?: ObjectId;
  acceptedAt: Date;
  ip: string | null;
  userAgent: string | null;
}

export interface LessonAttemptDoc {
  _id: ObjectId;
  userId: ObjectId;
  lessonId: string;
  /** exerciseId -> si la primera respuesta fue correcta */
  answers: Record<string, boolean>;
  startedAt: Date;
}

export interface XpEventDoc {
  _id: ObjectId;
  userId: ObjectId;
  amount: number;
  source: "simulador" | "ruta" | "ia" | "diaria" | "bandeja" | "llamada";
  createdAt: Date;
}

/** Uso de “¿Es estafa?” con IA: solo para el límite diario. No se guarda el texto revisado. */
export interface AiCheckDoc {
  _id: ObjectId;
  userId: ObjectId;
  day: string;
  createdAt: Date;
}

/** Suscripción a notificaciones (recordatorio diario). Sin cuenta también se puede. */
export interface PushSubDoc {
  _id: ObjectId;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  lang: "es" | "en";
  userId?: ObjectId;
  createdAt: Date;
  lastSentAt?: Date;
}

export interface AiChatDoc {
  /** Idioma en que se juega (los antiguos: español) */
  lang?: "es" | "en";
  _id: ObjectId;
  userId: ObjectId;
  personaId: string;
  /** Día en El Salvador, para el límite diario */
  day: string;
  messages: { role: "user" | "assistant"; content: string }[];
  status: "active" | "won" | "lost" | "abandoned";
  verdict?: string;
  xpAwarded?: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Contadores por día (hora de El Salvador). Sin datos personales. */
export interface DailyStatDoc {
  /** "2026-11-20" */
  _id: string;
  visits?: number;
  logins?: number;
}

export interface SessionDoc {
  _id: ObjectId;
  /** sha256 del token de la cookie: si se filtra la base, las sesiones no sirven. */
  tokenHash: string;
  userId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
}

export type RunMode = "clasico" | "pro" | "contrarreloj" | "entrenamiento";

export interface AnswerDoc {
  scenarioId: string;
  verdict: Verdict | null;
  verdictCorrect: boolean;
  points: number;
  falsePositives: number;
  signals: { id: string; category: SignalCategory; found: boolean }[];
  timeMs?: number;
}

export interface RunDoc {
  _id: ObjectId;
  userId: ObjectId;
  mode: RunMode;
  createdAt: Date;
  /** 0-100, promedio de las respuestas */
  score: number;
  answers: AnswerDoc[];
}

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderDoc {
  _id: ObjectId;
  /** identificadorEnlaceComercio enviado a Wompi */
  reference: string;
  userId: ObjectId;
  /** "empresa" / "familia" = compra del plan Empresa o Pro Familiar (ver `business`) */
  planId: PlanId | "empresa" | "familia";
  amount: number;
  days: number;
  /** Nombre del producto para mostrar */
  title?: string;
  /** Solo plan Empresa: qué compra y para qué empresa */
  business?: { orgId: ObjectId; action: "renovar" | "agregar"; seats: number };
  status: OrderStatus;
  provider: "wompi" | "mock";
  providerLinkId?: string;
  /** Transacción que pagó la orden. Única: un pago no puede activar dos órdenes. */
  providerTxId?: string;
  /** Último intento rechazado, solo informativo. */
  failedTxId?: string;
  livemode?: boolean;
  createdAt: Date;
  paidAt?: Date;
  /** Reembolso registrado desde el panel (la devolución del dinero se hace en Wompi). */
  refund?: {
    amount: number;
    /** Días de Pro que se quitaron a la cuenta (0 si se dejó el acceso) */
    removedDays: number;
    /** Plan Empresa: puestos que se quitaron */
    removedSeats?: number;
    note: string;
    at: Date;
    /** Correo del administrador que lo registró */
    by: string;
  };
}

export interface PasswordResetDoc {
  _id: ObjectId;
  /** sha256 del token del enlace; el token en claro solo viaja en el correo. */
  tokenHash: string;
  userId: ObjectId;
  email: string;
  createdAt: Date;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface LoginAttemptDoc {
  _id: ObjectId;
  email: string;
  createdAt: Date;
}
