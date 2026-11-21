import "server-only";
import { setServers } from "node:dns";
import { MongoClient, type Db } from "mongodb";
import { env } from "./env";
import type { DailyStatDoc, LoginAttemptDoc, OrderDoc, PasswordResetDoc, RunDoc, SessionDoc, UserDoc } from "./models";

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
  ]);
}
