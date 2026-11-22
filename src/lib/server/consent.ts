import "server-only";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { classConsentText, CONSENT_TEXT, LEGAL, orgConsentText, type ConsentDocument } from "@/lib/legal";
import { collections } from "./db";
import type { ConsentDoc } from "./models";

export { consentError, readConsent } from "@/lib/legal";

const DOCS: ConsentDocument[] = ["terminos", "privacidad"];

/** IP del cliente: Vercel la pone primero en x-forwarded-for. */
function clientIp(h: Headers) {
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (fwd || h.get("x-real-ip") || "").slice(0, 64) || null;
}

/** Guarda una aceptación por documento (terminos y privacidad) con fecha, versión, IP y navegador. */
export async function recordConsents(input: {
  userId: ObjectId;
  email: string;
  source: ConsentDoc["source"];
  orderRef?: string;
}) {
  const h = await headers();
  const ip = clientIp(h);
  const userAgent = h.get("user-agent")?.slice(0, 300) ?? null;
  const acceptedAt = new Date();
  const docs: ConsentDoc[] = DOCS.map((document) => ({
    _id: new ObjectId(),
    userId: input.userId,
    email: input.email,
    document,
    version: LEGAL[document].version,
    text: CONSENT_TEXT[document],
    source: input.source,
    ...(input.orderRef ? { orderRef: input.orderRef } : {}),
    acceptedAt,
    ip,
    userAgent,
  }));
  const { consents } = await collections();
  await consents.insertMany(docs);
}

/** Guarda la autorización del estudiante para que su docente vea su avance. */
export async function recordClassConsent(input: { userId: ObjectId; email: string; classId: ObjectId; className: string }) {
  const h = await headers();
  const { consents } = await collections();
  await consents.insertOne({
    _id: new ObjectId(),
    userId: input.userId,
    email: input.email,
    document: "clase",
    version: LEGAL.privacidad.version,
    text: classConsentText(input.className),
    source: "unirse-clase",
    classId: input.classId,
    acceptedAt: new Date(),
    ip: clientIp(h),
    userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
  });
}

/** Guarda la autorización del empleado para que su empresa vea su avance y le envíe simulacros. */
export async function recordOrgConsent(input: {
  userId: ObjectId;
  email: string;
  orgId: ObjectId;
  orgName: string;
  kind?: "empresa" | "familia";
}) {
  const h = await headers();
  const { consents } = await collections();
  await consents.insertOne({
    _id: new ObjectId(),
    userId: input.userId,
    email: input.email,
    document: "empresa",
    version: LEGAL.privacidad.version,
    text: orgConsentText(input.orgName, input.kind),
    source: "unirse-empresa",
    orgId: input.orgId,
    acceptedAt: new Date(),
    ip: clientIp(h),
    userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
  });
}
