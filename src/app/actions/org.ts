"use server";

import { MongoServerError, ObjectId } from "mongodb";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  addSeatsPrice,
  BUSINESS,
  FAMILY,
  isAreaId,
  isValidSeats,
  orgActive,
  parseEmails,
  phishTemplate,
  subjectMatches,
  yearPrice,
  type OrgKind,
} from "@/lib/business";
import { dayKey } from "@/lib/dayKey";
import { inviteEmail, simulationEmail } from "@/lib/emails/business";
import { requestT } from "@/lib/i18n-server";
import { ORG_CONSENT_FIELD } from "@/lib/legal";
import { CheckoutError, startBusinessCheckout, startFamilyCheckout } from "@/lib/server/billing";
import { consentError, readConsent, recordConsents, recordOrgConsent } from "@/lib/server/consent";
import { collections } from "@/lib/server/db";
import { emailConfigured, sendEmail } from "@/lib/server/email";
import { env } from "@/lib/server/env";
import { joinOrg, newInviteCode, newSimToken, removeFromOrg, sha256 } from "@/lib/server/org";
import { getCurrentUser } from "@/lib/server/session";

const back = (msg: string, path = "/empresa"): never => redirect(`${path}?error=${encodeURIComponent(msg)}#comprar`);

/** El encargado de la empresa (o familia) de la sesión, o null. Con `kind`, solo si es de ese tipo. */
async function currentOwner(kind?: OrgKind) {
  const user = await getCurrentUser();
  if (!user?.org || user.org.role !== "owner") return null;
  const { orgs } = await collections();
  const org = await orgs.findOne({ _id: user.org._id, ownerId: user._id });
  if (!org || (kind && (org.kind ?? "empresa") !== kind)) return null;
  return { user, org };
}

const homeOf = (kind: OrgKind | undefined) => (kind === "familia" ? "/familia" : "/empresa");

/** Envía en grupos pequeños para no saturar el servicio de correo. */
async function inBatches<T>(items: T[], size: number, fn: (x: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += size) await Promise.all(items.slice(i, i + size).map(fn));
}

// ---------------------------------------------------------------- compra

/** Crea la empresa (si no existe) y paga un año para N puestos; también sirve para renovar. */
export async function orgCheckout(form: FormData) {
  const [user, { lang, t }] = await Promise.all([getCurrentUser(), requestT()]);
  if (!user) redirect(`/registro?next=${encodeURIComponent("/empresa")}`);
  if (user.org && user.org.role !== "owner")
    back(t(`Ya eres parte de ${user.org.name}. Sal de ahí para crear tu empresa.`, `You're already part of ${user.org.name}. Leave it to create your company.`));
  if (user.org?.kind === "familia")
    back(t("Ya administras un plan familiar. Para crear una empresa usa otra cuenta.", "You already manage a family plan. Use another account to create a company."));

  const seats = Number(form.get("seats"));
  if (!isValidSeats(seats)) back(t(`Elige entre ${BUSINESS.minSeats} y ${BUSINESS.maxSeats} empleados.`, `Choose between ${BUSINESS.minSeats} and ${BUSINESS.maxSeats} people.`));
  const missing = consentError(readConsent(form), lang);
  if (missing) back(missing);

  const { orgs, users } = await collections();
  let org = user.org ? await orgs.findOne({ _id: user.org._id, ownerId: user._id }) : null;

  if (!org) {
    const name = String(form.get("name") ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
    if (name.length < 2) back(t("Escribe el nombre de tu empresa.", "Enter your company name."));
    const doc = {
      _id: new ObjectId(),
      kind: "empresa" as const,
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
      if (e instanceof MongoServerError && e.code === 11000) back(t("Ya tienes una empresa creada.", "You already have a company."));
      throw e;
    }
    const r = await users.updateOne(
      { _id: user._id, orgId: { $exists: false } },
      { $set: { orgId: doc._id, orgRole: "owner", orgJoinedAt: new Date() } },
    );
    if (r.modifiedCount === 0) {
      await orgs.deleteOne({ _id: doc._id });
      back(t("Ya perteneces a una empresa.", "You already belong to a company."));
    }
    org = doc;
  } else {
    // Al renovar no se pueden quitar puestos en uso ni bajar los puestos de un plan vigente
    if (seats < org.memberCount)
      back(t(`Tu equipo ya tiene ${org.memberCount} personas: elige al menos esa cantidad.`, `Your team already has ${org.memberCount} people: choose at least that many.`));
    if (orgActive(org.paidUntil) && seats < org.seats)
      back(t(`Tu plan vigente tiene ${org.seats} puestos. Para renovar con menos, espera a que venza.`, `Your current plan has ${org.seats} seats. To renew with fewer, wait until it expires.`));
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
    back(e instanceof CheckoutError ? e.message : t("No pudimos iniciar el pago. Intenta de nuevo.", "We couldn't start the payment. Please try again."));
  }
  redirect(url!);
}

/** Agrega puestos a un plan vigente, pagando la parte proporcional hasta el vencimiento. */
export async function addSeatsCheckout(form: FormData) {
  const owner = await currentOwner("empresa");
  if (!owner) redirect("/empresa");
  const { user, org } = owner;
  const { lang, t } = await requestT();
  if (!orgActive(org.paidUntil)) back(t("Tu plan venció: renuévalo para agregar puestos.", "Your plan expired: renew it to add seats."));
  const add = Number(form.get("add"));
  if (!Number.isInteger(add) || add < 1 || org.seats + add > BUSINESS.maxSeats)
    back(t(`Puedes agregar entre 1 y ${BUSINESS.maxSeats - org.seats} puestos.`, `You can add between 1 and ${BUSINESS.maxSeats - org.seats} seats.`));
  const missing = consentError(readConsent(form), lang);
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
    back(e instanceof CheckoutError ? e.message : t("No pudimos iniciar el pago. Intenta de nuevo.", "We couldn't start the payment. Please try again."));
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
  const [owner, { lang, t }] = await Promise.all([currentOwner(), requestT()]);
  if (!owner) return { error: t("No autorizado.", "Not authorized.") };
  const { user, org } = owner;
  if (!orgActive(org.paidUntil)) return { error: t("Activa tu plan para invitar a tu equipo.", "Activate your plan to invite your team.") };

  const { valid, invalid, overLimit } = parseEmails(String(form.get("emails") ?? ""), 50);
  if (!valid.length) return { error: t("Escribe al menos un correo válido.", "Enter at least one valid email."), invalid };
  if (overLimit) return { error: t("Máximo 50 correos por envío.", "Up to 50 emails at a time."), invalid };

  // Límite diario atómico
  const { orgs } = await collections();
  const today = dayKey();
  const used = org.invites?.day === today ? org.invites.count : 0;
  if (used + valid.length > BUSINESS.invitesPerDay)
    return {
      error: t(
        `Hoy puedes enviar ${Math.max(0, BUSINESS.invitesPerDay - used)} invitaciones más.`,
        `You can send ${Math.max(0, BUSINESS.invitesPerDay - used)} more invitations today.`,
      ),
    };
  await orgs.updateOne({ _id: org._id }, { $set: { invites: { day: today, count: used + valid.length } } });

  const link = `${env.appUrl}/${lang}${homeOf(org.kind)}/unirse/${org.inviteCode}`;
  let sent = 0;
  await inBatches(valid, 10, async (to) => {
    const r = await sendEmail({ to, ...inviteEmail({ org: org.name, inviter: user.name, link, lang }) });
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
  redirect(`${homeOf(user.org.kind)}?salida=1`);
}

export async function joinOrgAction(form: FormData) {
  const code = String(form.get("code") ?? "").slice(0, 40);
  const kind: OrgKind = form.get("kind") === "familia" ? "familia" : "empresa";
  const path = `${homeOf(kind)}/unirse/${encodeURIComponent(code)}`;
  const user = await getCurrentUser();
  if (!user) redirect(`/registro?next=${encodeURIComponent(path)}`);
  if (form.get(ORG_CONSENT_FIELD) !== "si") redirect(`${path}?error=consentimiento`);

  const { result, orgId, orgName, orgKind } = await joinOrg(user._id, code);
  if (result === "joined") {
    try {
      await recordOrgConsent({ userId: user._id, email: user.email, orgId: orgId!, orgName: orgName!, kind: orgKind });
    } catch (e) {
      // Sin prueba de la autorización no se queda dentro
      await removeFromOrg(orgId!, user._id);
      throw e;
    }
    redirect(`${homeOf(orgKind)}?unido=1`);
  }
  redirect(`${path}?error=${result}`);
}

/** Compra (o renueva) Pro Familiar. Crea la familia si aún no existe. */
export async function familyCheckout(form: FormData) {
  const [user, { lang, t }] = await Promise.all([getCurrentUser(), requestT()]);
  if (!user) redirect(`/registro?next=${encodeURIComponent("/familia")}`);
  const fail = (msg: string): never => redirect(`/familia?error=${encodeURIComponent(msg)}#comprar`);
  if (user.org && (user.org.role !== "owner" || user.org.kind !== "familia"))
    fail(t(`Ya eres parte de ${user.org.name}. Sal de ahí para crear tu plan familiar.`, `You're already part of ${user.org.name}. Leave it to create your family plan.`));
  const missing = consentError(readConsent(form), lang);
  if (missing) fail(missing);

  const { orgs, users } = await collections();
  let org = user.org ? await orgs.findOne({ _id: user.org._id, ownerId: user._id, kind: "familia" }) : null;
  if (!org) {
    const name = String(form.get("name") ?? "").trim().replace(/\s+/g, " ").slice(0, 60) || t(`Familia de ${user.name.split(" ")[0]}`, `${user.name.split(" ")[0]}'s family`);
    const doc = {
      _id: new ObjectId(),
      kind: "familia" as const,
      name,
      ownerId: user._id,
      seats: FAMILY.seats,
      memberCount: 1,
      paidUntil: null,
      inviteCode: newInviteCode(),
      createdAt: new Date(),
    };
    try {
      await orgs.insertOne(doc);
    } catch (e) {
      if (e instanceof MongoServerError && e.code === 11000) fail(t("Ya tienes un plan creado.", "You already have a plan."));
      throw e;
    }
    const r = await users.updateOne(
      { _id: user._id, orgId: { $exists: false } },
      { $set: { orgId: doc._id, orgRole: "owner", orgJoinedAt: new Date() } },
    );
    if (r.modifiedCount === 0) {
      await orgs.deleteOne({ _id: doc._id });
      fail(t("Ya perteneces a otro plan.", "You already belong to another plan."));
    }
    org = doc;
  }

  let url: string;
  try {
    url = await startFamilyCheckout(user._id, { orgId: org._id, orgName: org.name }, (orderRef) =>
      recordConsents({ userId: user._id, email: user.email, source: "compra", orderRef }),
    );
  } catch (e) {
    if (!(e instanceof CheckoutError)) console.error("[familia] checkout", e);
    fail(e instanceof CheckoutError ? e.message : t("No pudimos iniciar el pago. Intenta de nuevo.", "We couldn't start the payment. Please try again."));
  }
  redirect(url!);
}

// ---------------------------------------------------------------- simulacros

export interface SimState {
  error?: string;
  sent?: number;
  targets?: number;
  devLinks?: string[];
}

export async function launchSimulation(_prev: SimState, form: FormData): Promise<SimState> {
  const [owner, { lang, t }] = await Promise.all([currentOwner("empresa"), requestT()]);
  if (!owner) return { error: t("No autorizado.", "Not authorized.") };
  const { user, org } = owner;
  if (!orgActive(org.paidUntil)) return { error: t("Activa tu plan para enviar simulacros.", "Activate your plan to send drills.") };
  // La plantilla sale en el idioma de quien la envía (así se escribe el correo)
  const tpl = phishTemplate(String(form.get("template") ?? ""), lang);
  if (!tpl) return { error: t("Elige una plantilla.", "Choose a template.") };
  if (env.isProd && !emailConfigured()) return { error: t("El envío de correos aún no está configurado en el sitio.", "Email sending isn't set up on the site yet.") };

  const { users, phishCampaigns, phishTargets } = await collections();
  const day = dayKey();
  if ((await phishCampaigns.countDocuments({ orgId: org._id, day })) >= BUSINESS.campaignsPerDay)
    return { error: t(`Máximo ${BUSINESS.campaignsPerDay} simulacros por día.`, `Up to ${BUSINESS.campaignsPerDay} drills a day.`) };

  // Solo empleados que se unieron (y aceptaron recibirlos); el encargado no se lo envía a sí mismo
  const members = await users.find({ orgId: org._id, orgRole: "member" }, { projection: { name: 1, email: 1 } }).toArray();
  if (!members.length) return { error: t("Aún no hay empleados en tu equipo. Invítalos primero.", "There are no employees on your team yet. Invite them first.") };

  const campaignId = new ObjectId();
  const now = new Date();
  await phishCampaigns.insertOne({
    _id: campaignId,
    orgId: org._id,
    templateId: tpl.id,
    lang,
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
    const link = `${env.appUrl}/${lang}/simulacro/${token}`;
    const r = await sendEmail({ to: m.email, ...simulationEmail({ t: tpl, org: org.name, name: m.name, link, lang }) });
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

// ---------------------------------------------------------------- reportar y áreas

export interface SuspiciousState {
  ok?: boolean;
  /** true: era un simulacro y lo detectó */
  simulacro?: boolean;
  error?: string;
}

/**
 * “Reportar phishing”: un empleado reporta un correo sospechoso. Si coincide con un simulacro que recibió
 * (últimos 14 días) cuenta como detectado; si no, se guarda para que lo vea su encargado.
 */
export async function reportSuspicious(_prev: SuspiciousState, form: FormData): Promise<SuspiciousState> {
  const [user, { t }] = await Promise.all([getCurrentUser(), requestT()]);
  if (!user?.org) return { error: t("Esta opción es para equipos con plan Empresa.", "This option is for teams on the Business plan.") };
  const subject = String(form.get("subject") ?? "").trim().replace(/\s+/g, " ").slice(0, 200);
  const sender = String(form.get("sender") ?? "").trim().slice(0, 120);
  const notes = String(form.get("notes") ?? "").trim().slice(0, 500);
  if (subject.length < 3) return { error: t("Copia el asunto del correo.", "Copy the email subject.") };

  const { phishTargets, phishCampaigns, orgReports, orgs } = await collections();
  const since = new Date(Date.now() - 14 * 864e5);
  const targets = await phishTargets.find({ orgId: user.org._id, userId: user._id, sentAt: { $gt: since } }).toArray();
  if (targets.length) {
    const [org, campaigns] = await Promise.all([
      orgs.findOne({ _id: user.org._id }, { projection: { name: 1 } }),
      phishCampaigns.find({ _id: { $in: targets.map((x) => x.campaignId) } }, { projection: { templateId: 1 } }).toArray(),
    ]);
    const templateOf = new Map(campaigns.map((c) => [c._id.toHexString(), c.templateId]));
    // Se compara con el asunto en los dos idiomas: no importa en cuál se envió
    const hit = targets.find((x) => {
      const id = templateOf.get(x.campaignId.toHexString()) ?? "";
      return (
        !!org &&
        (["es", "en"] as const).some((l) => {
          const tp = phishTemplate(id, l);
          return !!tp && subjectMatches(subject, tp.subject(org.name));
        })
      );
    });
    if (hit) {
      await phishTargets.updateOne({ _id: hit._id, reportedAt: { $exists: false } }, { $set: { reportedAt: new Date() } });
      return { ok: true, simulacro: true };
    }
  }

  if ((await orgReports.countDocuments({ userId: user._id, createdAt: { $gt: new Date(Date.now() - 864e5) } })) >= 10)
    return { error: t("Llegaste al límite de reportes por hoy.", "You've reached today's report limit.") };
  await orgReports.insertOne({ _id: new ObjectId(), orgId: user.org._id, userId: user._id, subject, sender, notes, createdAt: new Date() });
  return { ok: true, simulacro: false };
}

/** El encargado asigna (o quita) el área de una persona de su equipo. */
export async function setMemberArea(form: FormData) {
  const owner = await currentOwner("empresa");
  if (!owner) return;
  const id = String(form.get("userId") ?? "");
  const area = form.get("area");
  if (!ObjectId.isValid(id)) return;
  const { users } = await collections();
  await users.updateOne(
    { _id: new ObjectId(id), orgId: owner.org._id },
    isAreaId(area) ? { $set: { orgArea: area } } : { $unset: { orgArea: "" } },
  );
  refresh();
}

/** La persona abrió el enlace de un simulacro. Público: el token es la única credencial. */
export async function markSimClicked(token: string) {
  if (typeof token !== "string" || token.length < 20 || token.length > 64) return;
  const { phishTargets } = await collections();
  await phishTargets.updateOne({ tokenHash: sha256(token), clickedAt: { $exists: false } }, { $set: { clickedAt: new Date() } });
}
