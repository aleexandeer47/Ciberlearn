"use server";

import { MongoServerError, ObjectId } from "mongodb";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { addSeatsPrice, BUSINESS, isValidSeats, orgActive, parseEmails, PHISH_BY_ID, yearPrice } from "@/lib/business";
import { dayKey } from "@/lib/dayKey";
import { inviteEmail, simulationEmail } from "@/lib/emails/business";
import { ORG_CONSENT_FIELD } from "@/lib/legal";
import { CheckoutError, startBusinessCheckout } from "@/lib/server/billing";
import { consentError, readConsent, recordConsents, recordOrgConsent } from "@/lib/server/consent";
import { collections } from "@/lib/server/db";
import { emailConfigured, sendEmail } from "@/lib/server/email";
import { env } from "@/lib/server/env";
import { joinOrg, newInviteCode, newSimToken, removeFromOrg, sha256 } from "@/lib/server/org";
import { getCurrentUser } from "@/lib/server/session";

const back = (msg: string, path = "/empresa"): never => redirect(`${path}?error=${encodeURIComponent(msg)}#comprar`);

/** El encargado de la empresa de la sesión, o null. */
async function currentOwner() {
  const user = await getCurrentUser();
  if (!user?.org || user.org.role !== "owner") return null;
  const { orgs } = await collections();
  const org = await orgs.findOne({ _id: user.org._id, ownerId: user._id });
  return org ? { user, org } : null;
}

/** Envía en grupos pequeños para no saturar el servicio de correo. */
async function inBatches<T>(items: T[], size: number, fn: (x: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += size) await Promise.all(items.slice(i, i + size).map(fn));
}

// ---------------------------------------------------------------- compra

/** Crea la empresa (si no existe) y paga un año para N puestos; también sirve para renovar. */
export async function orgCheckout(form: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect(`/registro?next=${encodeURIComponent("/empresa")}`);
  if (user.org && user.org.role !== "owner") back(`Ya eres parte de ${user.org.name}. Sal de esa empresa para crear la tuya.`);

  const seats = Number(form.get("seats"));
  if (!isValidSeats(seats)) back(`Elige entre ${BUSINESS.minSeats} y ${BUSINESS.maxSeats} empleados.`);
  const missing = consentError(readConsent(form));
  if (missing) back(missing);

  const { orgs, users } = await collections();
  let org = user.org ? await orgs.findOne({ _id: user.org._id, ownerId: user._id }) : null;

  if (!org) {
    const name = String(form.get("name") ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
    if (name.length < 2) back("Escribe el nombre de tu empresa.");
    const doc = {
      _id: new ObjectId(),
      name,
      ownerId: user._id,
      seats,
      memberCount: 1,
      paidUntil: null,
      inviteCode: newInviteCode(),
      createdAt: new Date(),
    };
    try {
      await orgs.insertOne(doc);
    } catch (e) {
      if (e instanceof MongoServerError && e.code === 11000) back("Ya tienes una empresa creada.");
      throw e;
    }
    const r = await users.updateOne(
      { _id: user._id, orgId: { $exists: false } },
      { $set: { orgId: doc._id, orgRole: "owner", orgJoinedAt: new Date() } },
    );
    if (r.modifiedCount === 0) {
      await orgs.deleteOne({ _id: doc._id });
      back("Ya perteneces a una empresa.");
    }
    org = doc;
  } else {
    // Al renovar no se pueden quitar puestos en uso ni bajar los puestos de un plan vigente
    if (seats < org.memberCount) back(`Tu equipo ya tiene ${org.memberCount} personas: elige al menos esa cantidad.`);
    if (orgActive(org.paidUntil) && seats < org.seats)
      back(`Tu plan vigente tiene ${org.seats} puestos. Para renovar con menos, espera a que venza.`);
  }

  let url: string;
  try {
    url = await startBusinessCheckout(
      user._id,
      { orgId: org._id, orgName: org.name, action: "renovar", seats, amount: yearPrice(seats) },
      (orderRef) => recordConsents({ userId: user._id, email: user.email, source: "compra", orderRef }),
    );
  } catch (e) {
    if (!(e instanceof CheckoutError)) console.error("[empresa] checkout", e);
    back(e instanceof CheckoutError ? e.message : "No pudimos iniciar el pago. Intenta de nuevo.");
  }
  redirect(url!);
}

/** Agrega puestos a un plan vigente, pagando la parte proporcional hasta el vencimiento. */
export async function addSeatsCheckout(form: FormData) {
  const owner = await currentOwner();
  if (!owner) redirect("/empresa");
  const { user, org } = owner;
  if (!orgActive(org.paidUntil)) back("Tu plan venció: renuévalo para agregar puestos.");
  const add = Number(form.get("add"));
  if (!Number.isInteger(add) || add < 1 || org.seats + add > BUSINESS.maxSeats)
    back(`Puedes agregar entre 1 y ${BUSINESS.maxSeats - org.seats} puestos.`);
  const missing = consentError(readConsent(form));
  if (missing) back(missing);

  let url: string;
  try {
    url = await startBusinessCheckout(
      user._id,
      { orgId: org._id, orgName: org.name, action: "agregar", seats: add, amount: addSeatsPrice(add, org.paidUntil) },
      (orderRef) => recordConsents({ userId: user._id, email: user.email, source: "compra", orderRef }),
    );
  } catch (e) {
    if (!(e instanceof CheckoutError)) console.error("[empresa] agregar puestos", e);
    back(e instanceof CheckoutError ? e.message : "No pudimos iniciar el pago. Intenta de nuevo.");
  }
  redirect(url!);
}

// ---------------------------------------------------------------- equipo

export interface InviteState {
  error?: string;
  sent?: number;
  failed?: number;
  invalid?: string[];
  /** Solo en desarrollo sin servicio de correo */
  devLink?: string;
}

export async function inviteByEmail(_prev: InviteState, form: FormData): Promise<InviteState> {
  const owner = await currentOwner();
  if (!owner) return { error: "No autorizado." };
  const { user, org } = owner;
  if (!orgActive(org.paidUntil)) return { error: "Activa tu plan para invitar a tu equipo." };

  const { valid, invalid, overLimit } = parseEmails(String(form.get("emails") ?? ""), 50);
  if (!valid.length) return { error: "Escribe al menos un correo válido.", invalid };
  if (overLimit) return { error: "Máximo 50 correos por envío.", invalid };

  // Límite diario atómico
  const { orgs } = await collections();
  const today = dayKey();
  const used = org.invites?.day === today ? org.invites.count : 0;
  if (used + valid.length > BUSINESS.invitesPerDay)
    return { error: `Hoy puedes enviar ${Math.max(0, BUSINESS.invitesPerDay - used)} invitaciones más.` };
  await orgs.updateOne({ _id: org._id }, { $set: { invites: { day: today, count: used + valid.length } } });

  const link = `${env.appUrl}/empresa/unirse/${org.inviteCode}`;
  let sent = 0;
  await inBatches(valid, 10, async (to) => {
    const r = await sendEmail({ to, ...inviteEmail({ org: org.name, inviter: user.name, link }) });
    if (r.sent) sent++;
  });
  return {
    sent,
    failed: valid.length - sent,
    invalid,
    devLink: !env.isProd && !emailConfigured() ? link : undefined,
  };
}

/** Cambia el enlace de invitación: el anterior deja de funcionar. */
export async function rotateInvite() {
  const owner = await currentOwner();
  if (!owner) return;
  const { orgs } = await collections();
  await orgs.updateOne({ _id: owner.org._id }, { $set: { inviteCode: newInviteCode() } });
  refresh();
}

export async function removeMember(form: FormData) {
  const owner = await currentOwner();
  if (!owner) return;
  const id = String(form.get("userId") ?? "");
  if (!ObjectId.isValid(id)) return;
  await removeFromOrg(owner.org._id, new ObjectId(id));
  refresh();
}

/** Un empleado sale de su empresa. El encargado no puede salir de la suya. */
export async function leaveOrg() {
  const user = await getCurrentUser();
  if (!user?.org || user.org.role !== "member") redirect("/empresa");
  await removeFromOrg(user.org._id, user._id);
  redirect("/empresa?salida=1");
}

export async function joinOrgAction(form: FormData) {
  const code = String(form.get("code") ?? "").slice(0, 40);
  const path = `/empresa/unirse/${encodeURIComponent(code)}`;
  const user = await getCurrentUser();
  if (!user) redirect(`/registro?next=${encodeURIComponent(path)}`);
  if (form.get(ORG_CONSENT_FIELD) !== "si") redirect(`${path}?error=consentimiento`);

  const { result, orgId, orgName } = await joinOrg(user._id, code);
  if (result === "joined") {
    try {
      await recordOrgConsent({ userId: user._id, email: user.email, orgId: orgId!, orgName: orgName! });
    } catch (e) {
      // Sin prueba de la autorización no se queda dentro
      await removeFromOrg(orgId!, user._id);
      throw e;
    }
    redirect("/empresa?unido=1");
  }
  redirect(`${path}?error=${result}`);
}

// ---------------------------------------------------------------- simulacros

export interface SimState {
  error?: string;
  sent?: number;
  targets?: number;
  devLinks?: string[];
}

export async function launchSimulation(_prev: SimState, form: FormData): Promise<SimState> {
  const owner = await currentOwner();
  if (!owner) return { error: "No autorizado." };
  const { user, org } = owner;
  if (!orgActive(org.paidUntil)) return { error: "Activa tu plan para enviar simulacros." };
  const t = PHISH_BY_ID.get(String(form.get("template") ?? ""));
  if (!t) return { error: "Elige una plantilla." };
  if (env.isProd && !emailConfigured()) return { error: "El envío de correos aún no está configurado en el sitio." };

  const { users, phishCampaigns, phishTargets } = await collections();
  const day = dayKey();
  if ((await phishCampaigns.countDocuments({ orgId: org._id, day })) >= BUSINESS.campaignsPerDay)
    return { error: `Máximo ${BUSINESS.campaignsPerDay} simulacros por día.` };

  // Solo empleados que se unieron (y aceptaron recibirlos); el encargado no se lo envía a sí mismo
  const members = await users.find({ orgId: org._id, orgRole: "member" }, { projection: { name: 1, email: 1 } }).toArray();
  if (!members.length) return { error: "Aún no hay empleados en tu equipo. Invítalos primero." };

  const campaignId = new ObjectId();
  const now = new Date();
  await phishCampaigns.insertOne({
    _id: campaignId,
    orgId: org._id,
    templateId: t.id,
    createdBy: user._id,
    createdAt: now,
    day,
    targets: members.length,
    sent: 0,
  });

  const tokens = members.map((m) => ({ m, token: newSimToken(), _id: new ObjectId() }));
  await phishTargets.insertMany(
    tokens.map(({ m, token, _id }) => ({
      _id,
      campaignId,
      orgId: org._id,
      userId: m._id,
      email: m.email,
      tokenHash: sha256(token),
      sentAt: null,
    })),
  );

  let sent = 0;
  await inBatches(tokens, 10, async ({ m, token, _id }) => {
    const link = `${env.appUrl}/simulacro/${token}`;
    const r = await sendEmail({ to: m.email, ...simulationEmail({ t, org: org.name, name: m.name, link }) });
    if (r.sent) {
      sent++;
      await phishTargets.updateOne({ _id }, { $set: { sentAt: new Date() } });
    }
  });
  await phishCampaigns.updateOne({ _id: campaignId }, { $set: { sent } });

  // En desarrollo sin correo: se marcan como enviados y se muestran algunos enlaces para probar
  if (!env.isProd && !emailConfigured()) {
    await phishTargets.updateMany({ campaignId }, { $set: { sentAt: new Date() } });
    await phishCampaigns.updateOne({ _id: campaignId }, { $set: { sent: members.length } });
    refresh();
    return { sent: members.length, targets: members.length, devLinks: tokens.slice(0, 3).map((x) => `/simulacro/${x.token}`) };
  }
  refresh();
  return { sent, targets: members.length };
}

/** La persona abrió el enlace de un simulacro. Público: el token es la única credencial. */
export async function markSimClicked(token: string) {
  if (typeof token !== "string" || token.length < 20 || token.length > 64) return;
  const { phishTargets } = await collections();
  await phishTargets.updateOne({ tokenHash: sha256(token), clickedAt: { $exists: false } }, { $set: { clickedAt: new Date() } });
}
