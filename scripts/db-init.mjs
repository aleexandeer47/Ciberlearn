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
