// Crea la base de datos y sus índices. Uso: npm run db:init
// (La app también crea los índices sola la primera vez que se conecta.)
import { setServers } from "node:dns";
import { MongoClient } from "mongodb";

if (process.env.DNS_SERVERS) setServers(process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean));

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const name = process.env.MONGODB_DB ?? "anzuelo";

const client = await new MongoClient(uri, { serverSelectionTimeoutMS: 5000 }).connect();
const db = client.db(name);

const specs = {
  users: [
    [{ email: 1 }, { unique: true }],
    [{ createdAt: -1 }, {}],
    [{ xp: -1 }, {}],
    [{ nicknameLower: 1 }, { unique: true, partialFilterExpression: { nicknameLower: { $type: "string" } } }],
    [{ orgId: 1 }, { partialFilterExpression: { orgId: { $exists: true } } }],
    [{ shareId: 1 }, { unique: true, partialFilterExpression: { shareId: { $type: "string" } } }],
    [{ "certificate.code": 1 }, { unique: true, partialFilterExpression: { "certificate.code": { $type: "string" } } }],
  ],
  challenges: [
    [{ code: 1 }, { unique: true }],
    [{ creatorId: 1, createdAt: -1 }, {}],
    [{ createdAt: 1 }, { expireAfterSeconds: 90 * 86400 }],
  ],
  challenge_plays: [
    [{ challengeId: 1, score: -1 }, {}],
    [{ createdAt: 1 }, { expireAfterSeconds: 90 * 86400 }],
  ],
  daily_answers: [
    [{ userId: 1, day: 1 }, { unique: true }],
    [{ createdAt: 1 }, { expireAfterSeconds: 180 * 86400 }],
  ],
  scam_reports: [
    [{ status: 1, createdAt: -1 }, {}],
    [{ userId: 1, createdAt: -1 }, {}],
    [{ reviewedAt: 1 }, { expireAfterSeconds: 90 * 86400, partialFilterExpression: { status: "rejected" } }],
  ],
  inbox_sessions: [
    [{ createdAt: 1 }, { expireAfterSeconds: 86400 }],
    [{ userId: 1 }, {}],
  ],
  inbox_results: [
    [{ userId: 1, createdAt: -1 }, {}],
    [{ orgId: 1, createdAt: -1 }, {}],
  ],
  org_reports: [[{ orgId: 1, createdAt: -1 }, {}]],
  org_scores: [[{ orgId: 1, month: 1 }, {}]],
  classes: [
    [{ code: 1 }, { unique: true }],
    [{ teacherId: 1, createdAt: -1 }, {}],
  ],
  class_members: [
    [{ classId: 1, userId: 1 }, { unique: true }],
    [{ userId: 1 }, {}],
  ],
  lesson_attempts: [
    [{ userId: 1, lessonId: 1 }, { unique: true }],
    [{ startedAt: 1 }, { expireAfterSeconds: 2 * 86400 }],
  ],
  xp_events: [
    [{ createdAt: -1, userId: 1 }, {}],
    [{ createdAt: 1 }, { expireAfterSeconds: 60 * 86400 }],
  ],
  ai_chats: [
    [{ userId: 1, day: 1 }, {}],
    [{ createdAt: 1 }, { expireAfterSeconds: 30 * 86400 }],
  ],
  ai_checks: [
    [{ userId: 1, day: 1 }, {}],
    [{ createdAt: 1 }, { expireAfterSeconds: 2 * 86400 }],
  ],
  push_subs: [[{ endpoint: 1 }, { unique: true }]],
  // Prueba de aceptación de términos y privacidad: sin TTL
  consents: [[{ userId: 1, acceptedAt: -1 }, {}]],
  // Plan Empresa
  orgs: [
    [{ inviteCode: 1 }, { unique: true }],
    [{ ownerId: 1 }, { unique: true }],
  ],
  phish_campaigns: [[{ orgId: 1, createdAt: -1 }, {}]],
  phish_targets: [
    [{ tokenHash: 1 }, { unique: true }],
    [{ orgId: 1, userId: 1 }, {}],
    [{ campaignId: 1 }, {}],
  ],
  // _id = "YYYY-MM-DD": no necesita índices extra
  daily_stats: [],
  sessions: [
    [{ tokenHash: 1 }, { unique: true }],
    [{ expiresAt: 1 }, { expireAfterSeconds: 0 }],
  ],
  runs: [[{ userId: 1, createdAt: -1 }, {}]],
  orders: [
    [{ reference: 1 }, { unique: true }],
    [{ userId: 1, createdAt: -1 }, {}],
    [{ status: 1, paidAt: -1 }, {}],
    [{ providerTxId: 1 }, { unique: true, partialFilterExpression: { providerTxId: { $type: "string" } } }],
  ],
  login_attempts: [
    [{ createdAt: 1 }, { expireAfterSeconds: 15 * 60 }],
    [{ email: 1 }, {}],
  ],
  password_resets: [
    [{ tokenHash: 1 }, { unique: true }],
    [{ expiresAt: 1 }, { expireAfterSeconds: 86400 }],
    [{ email: 1, createdAt: -1 }, {}],
  ],
};

const existing = new Set((await db.listCollections().toArray()).map((c) => c.name));
for (const [coll, indexes] of Object.entries(specs)) {
  if (!existing.has(coll)) await db.createCollection(coll);
  for (const [keys, opts] of indexes) await db.collection(coll).createIndex(keys, opts);
  console.log(`✓ ${coll} (${indexes.length} índices)`);
}
// Nunca mostrar usuario ni contraseña en la consola.
const safeUri = uri.replace(/\/\/[^@/]+@/, "//***:***@").split("?")[0];
console.log(`Base "${name}" lista en ${safeUri}`);
await client.close();
