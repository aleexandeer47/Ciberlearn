// Da (o quita) permiso de administrador a una cuenta que ya existe.
// Uso:   npm run admin -- correo@ejemplo.com
//        npm run admin -- correo@ejemplo.com --quitar
import { setServers } from "node:dns";
import { MongoClient } from "mongodb";

if (process.env.DNS_SERVERS) setServers(process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean));

// Acepta el correo en cualquier posición y tolera guiones pegados ("--correo@x.com").
const args = process.argv.slice(2);
const email = (args.find((a) => a.includes("@")) ?? "").replace(/^-+/, "").trim().toLowerCase();
const remove = args.includes("--quitar");
if (!email.includes("@")) {
  console.error("Uso: npm run admin -- correo@ejemplo.com [--quitar]");
  process.exit(1);
}

const client = await new MongoClient(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017", {
  serverSelectionTimeoutMS: 8000,
}).connect();
const users = client.db(process.env.MONGODB_DB ?? "anzuelo").collection("users");

const update = remove ? { $unset: { role: "" } } : { $set: { role: "admin" } };
const res = await users.updateOne({ email }, update);
if (res.matchedCount === 0) {
  console.error(`No existe una cuenta con el correo ${email}. Primero regístrate en /registro.`);
  process.exitCode = 1;
} else {
  console.log(remove ? `✓ ${email} ya no es administrador.` : `✓ ${email} ahora es administrador. Entra en /admin.`);
  const admins = await users.find({ role: "admin" }, { projection: { email: 1 } }).toArray();
  console.log(`Administradores: ${admins.map((a) => a.email).join(", ") || "ninguno"}`);
}
await client.close();
