import "server-only";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { CONSENT_TEXT, LEGAL, type ConsentDocument } from "@/lib/legal";
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
