import type { ObjectId } from "mongodb";
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
  document: "terminos" | "privacidad";
  /** Versión del documento aceptado (src/lib/legal.ts) */
  version: string;
  /** Texto exacto de la casilla que se marcó */
  text: string;
  /** Formulario donde se aceptó */
  source: "registro" | "compra";
  /** Referencia de la orden si se aceptó al comprar */
  orderRef?: string;
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
  source: "simulador" | "ruta" | "ia";
  createdAt: Date;
}

export interface AiChatDoc {
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
  planId: PlanId;
  amount: number;
  days: number;
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
