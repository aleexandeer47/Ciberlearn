import "server-only";
import { setServers } from "node:dns";
import { MongoClient, type Db } from "mongodb";
import { env } from "./env";
import type {
  AiChatDoc,
  ChallengeDoc,
  ChallengePlayDoc,
  ConsentDoc,
  DailyAnswerDoc,
  InboxResultDoc,
  InboxSessionDoc,
  OrgReportDoc,
  OrgScoreDoc,
  ScamReportDoc,
  DailyStatDoc,
  LessonAttemptDoc,
  LoginAttemptDoc,
  OrderDoc,
  OrgDoc,
  PasswordResetDoc,
  PhishCampaignDoc,
  PhishTargetDoc,
  RunDoc,
  SessionDoc,
  UserDoc,
  XpEventDoc,
} from "./models";

// En desarrollo Next recarga módulos: guardamos el cliente en globalThis para
// no abrir una conexión nueva en cada cambio. (Nombre con versión: una versión
// anterior del código guardaba también las conexiones fallidas.)
const g = globalThis as unknown as {
  __ciberlearnMongo?: Promise<MongoClient>;
  __ciberlearnIndexes?: Promise<void>;
};

// Opcional: algunos Windows hacen que Node consulte el DNS en 127.0.0.1 y falla la
// cadena mongodb+srv:// (querySrv ECONNREFUSED). DNS_SERVERS=192.168.1.1,8.8.8.8 lo corrige.
// Se aplica justo antes de conectar (no al cargar el módulo), por si Next recargó el .env.
function applyDnsServers() {
  const list = process.env.DNS_SERVERS?.split(",").map((s) => s.trim()).filter(Boolean);
  if (list?.length) setServers(list);
}

function client() {
  if (!g.__ciberlearnMongo) {
    applyDnsServers();
    const uri = process.env.MONGODB_URI ?? env.mongoUri;
    g.__ciberlearnMongo = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 8000 })
      .connect()
      .catch((e) => {
        // Una conexión fallida no se guarda: la próxima petición vuelve a intentar.
        g.__ciberlearnMongo = undefined;
        g.__ciberlearnIndexes = undefined;
        throw e;
      });
  }
  return g.__ciberlearnMongo;
}

export async function db(): Promise<Db> {
  const d = (await client()).db(process.env.MONGODB_DB ?? env.mongoDb);
  g.__ciberlearnIndexes ??= ensureIndexes(d).catch((e) => {
    g.__ciberlearnIndexes = undefined;
    throw e;
  });
  await g.__ciberlearnIndexes;
  return d;
}

export async function collections() {
  const d = await db();
  return {
    users: d.collection<UserDoc>("users"),
    sessions: d.collection<SessionDoc>("sessions"),
    runs: d.collection<RunDoc>("runs"),
    orders: d.collection<OrderDoc>("orders"),
    loginAttempts: d.collection<LoginAttemptDoc>("login_attempts"),
    passwordResets: d.collection<PasswordResetDoc>("password_resets"),
    dailyStats: d.collection<DailyStatDoc>("daily_stats"),
    lessonAttempts: d.collection<LessonAttemptDoc>("lesson_attempts"),
    xpEvents: d.collection<XpEventDoc>("xp_events"),
    aiChats: d.collection<AiChatDoc>("ai_chats"),
    consents: d.collection<ConsentDoc>("consents"),
    orgs: d.collection<OrgDoc>("orgs"),
    phishCampaigns: d.collection<PhishCampaignDoc>("phish_campaigns"),
    phishTargets: d.collection<PhishTargetDoc>("phish_targets"),
    challenges: d.collection<ChallengeDoc>("challenges"),
    challengePlays: d.collection<ChallengePlayDoc>("challenge_plays"),
    dailyAnswers: d.collection<DailyAnswerDoc>("daily_answers"),
    scamReports: d.collection<ScamReportDoc>("scam_reports"),
    orgReports: d.collection<OrgReportDoc>("org_reports"),
    orgScores: d.collection<OrgScoreDoc>("org_scores"),
    inboxSessions: d.collection<InboxSessionDoc>("inbox_sessions"),
    inboxResults: d.collection<InboxResultDoc>("inbox_results"),
  };
}

export async function ensureIndexes(d: Db) {
  await Promise.all([
    d.collection("users").createIndex({ email: 1 }, { unique: true }),
    d.collection("users").createIndex({ createdAt: -1 }),
    d.collection("orders").createIndex({ status: 1, paidAt: -1 }),
    // Un mismo pago no puede activar dos órdenes
    d.collection("orders").createIndex(
      { providerTxId: 1 },
      { unique: true, partialFilterExpression: { providerTxId: { $type: "string" } } },
    ),
    d.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
    // TTL: Mongo borra solo las sesiones vencidas
    d.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    d.collection("runs").createIndex({ userId: 1, createdAt: -1 }),
    d.collection("orders").createIndex({ reference: 1 }, { unique: true }),
    d.collection("orders").createIndex({ userId: 1, createdAt: -1 }),
    d.collection("login_attempts").createIndex({ createdAt: 1 }, { expireAfterSeconds: 15 * 60 }),
    d.collection("login_attempts").createIndex({ email: 1 }),
    d.collection("password_resets").createIndex({ tokenHash: 1 }, { unique: true }),
    // Se borran solos 1 día después de vencer (la validez real es de 1 hora).
    d.collection("password_resets").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 86400 }),
    d.collection("password_resets").createIndex({ email: 1, createdAt: -1 }),
    // Ruta, XP, ranking y chats con IA
    d.collection("users").createIndex({ xp: -1 }),
    d.collection("users").createIndex(
      { nicknameLower: 1 },
      { unique: true, partialFilterExpression: { nicknameLower: { $type: "string" } } },
    ),
    d.collection("lesson_attempts").createIndex({ userId: 1, lessonId: 1 }, { unique: true }),
    // Intentos abandonados se borran solos a los 2 días
    d.collection("lesson_attempts").createIndex({ startedAt: 1 }, { expireAfterSeconds: 2 * 86400 }),
    d.collection("xp_events").createIndex({ createdAt: -1, userId: 1 }),
    // El total queda en users.xp; los eventos solo sirven para el ranking semanal
    d.collection("xp_events").createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 86400 }),
    d.collection("ai_chats").createIndex({ userId: 1, day: 1 }),
    // Las conversaciones con la IA se borran solas a los 30 días
    d.collection("ai_chats").createIndex({ createdAt: 1 }, { expireAfterSeconds: 30 * 86400 }),
    // Registro de aceptaciones de términos y privacidad (sin TTL: es la prueba del consentimiento)
    d.collection("consents").createIndex({ userId: 1, acceptedAt: -1 }),
    // Plan Empresa
    d.collection("orgs").createIndex({ inviteCode: 1 }, { unique: true }),
    d.collection("orgs").createIndex({ ownerId: 1 }, { unique: true }),
    d.collection("users").createIndex({ orgId: 1 }, { partialFilterExpression: { orgId: { $exists: true } } }),
    d.collection("phish_campaigns").createIndex({ orgId: 1, createdAt: -1 }),
    d.collection("phish_targets").createIndex({ tokenHash: 1 }, { unique: true }),
    d.collection("phish_targets").createIndex({ orgId: 1, userId: 1 }),
    d.collection("phish_targets").createIndex({ campaignId: 1 }),
    // Fase 1: retos, estafa del día, alertas y tarjetas
    d.collection("challenges").createIndex({ code: 1 }, { unique: true }),
    d.collection("challenges").createIndex({ creatorId: 1, createdAt: -1 }),
    // Los retos y sus partidas se borran solos a los 90 días
    d.collection("challenges").createIndex({ createdAt: 1 }, { expireAfterSeconds: 90 * 86400 }),
    d.collection("challenge_plays").createIndex({ challengeId: 1, score: -1 }),
    d.collection("challenge_plays").createIndex({ createdAt: 1 }, { expireAfterSeconds: 90 * 86400 }),
    d.collection("daily_answers").createIndex({ userId: 1, day: 1 }, { unique: true }),
    d.collection("daily_answers").createIndex({ createdAt: 1 }, { expireAfterSeconds: 180 * 86400 }),
    d.collection("scam_reports").createIndex({ status: 1, createdAt: -1 }),
    d.collection("scam_reports").createIndex({ userId: 1, createdAt: -1 }),
    // Los reportes rechazados se borran solos a los 90 días de revisarlos
    d.collection("scam_reports").createIndex(
      { reviewedAt: 1 },
      { expireAfterSeconds: 90 * 86400, partialFilterExpression: { status: "rejected" } },
    ),
    // Fase 2: bandeja, reportes del equipo e índice de preparación
    d.collection("inbox_sessions").createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }),
    d.collection("inbox_sessions").createIndex({ userId: 1 }),
    d.collection("inbox_results").createIndex({ userId: 1, createdAt: -1 }),
    d.collection("inbox_results").createIndex({ orgId: 1, createdAt: -1 }),
    d.collection("org_reports").createIndex({ orgId: 1, createdAt: -1 }),
    d.collection("org_scores").createIndex({ orgId: 1, month: 1 }),
    d.collection("users").createIndex({ shareId: 1 }, { unique: true, partialFilterExpression: { shareId: { $type: "string" } } }),
    d.collection("users").createIndex(
      { "certificate.code": 1 },
      { unique: true, partialFilterExpression: { "certificate.code": { $type: "string" } } },
    ),
  ]);
}
