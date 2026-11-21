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

export type OrderStatus = "pending" | "paid" | "failed";

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
