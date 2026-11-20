import "server-only";
import { setServers } from "node:dns";
import { MongoClient, type Db } from "mongodb";
import { env } from "./env";
import type { LoginAttemptDoc, OrderDoc, PasswordResetDoc, RunDoc, SessionDoc, UserDoc } from "./models";

// En desarrollo Next recarga módulos: guardamos el cliente en globalThis para
// no abrir una conexión nueva en cada cambio.
const g = globalThis as unknown as { __mongo?: Promise<MongoClient>; __indexes?: Promise<void> };

// Opcional: algunos Windows hacen que Node consulte el DNS en 127.0.0.1 y falla la
// cadena mongodb+srv:// (querySrv ECONNREFUSED). DNS_SERVERS=192.168.1.1,8.8.8.8 lo corrige.
if (process.env.DNS_SERVERS) {
  setServers(process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean));
}

function client() {
  g.__mongo ??= new MongoClient(env.mongoUri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 }).connect();
  return g.__mongo;
}

export async function db(): Promise<Db> {
  const d = (await client()).db(env.mongoDb);
  g.__indexes ??= ensureIndexes(d);
  await g.__indexes;
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
  };
}

export async function ensureIndexes(d: Db) {
  await Promise.all([
    d.collection("users").createIndex({ email: 1 }, { unique: true }),
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
