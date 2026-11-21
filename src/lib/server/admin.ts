import "server-only";
import type { Filter } from "mongodb";
import { buildSeries, summarizeRevenue, sumLast } from "@/lib/adminStats";
import { lastDays, TZ } from "@/lib/dayKey";
import { collections } from "./db";
import type { ConsentDoc, OrderDoc } from "./models";

/** Todo lo que muestra el panel de administración, en una sola consulta en paralelo. */
export async function getAdminStats(now = new Date()) {
  const { users, runs, orders, dailyStats } = await collections();
  const d7 = new Date(now.getTime() - 7 * 864e5);
  const d30 = new Date(now.getTime() - 30 * 864e5);
  const days = lastDays(30, now);

  const [totalUsers, new7, new30, proActive, active30, stats, signupAgg, paid, recentUsers, runs30] =
    await Promise.all([
      users.countDocuments(),
      users.countDocuments({ createdAt: { $gte: d7 } }),
      users.countDocuments({ createdAt: { $gte: d30 } }),
      users.countDocuments({ proUntil: { $gt: now } }),
      runs.distinct("userId", { createdAt: { $gte: d30 } }).then((ids) => ids.length),
      dailyStats.find({ _id: { $in: days } }).toArray(),
      users
        .aggregate<{ _id: string; n: number }>([
          { $match: { createdAt: { $gte: d30 } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TZ } }, n: { $sum: 1 } } },
        ])
        .toArray(),
      orders
        .find(
          { status: { $in: ["paid", "refunded"] } },
          { projection: { amount: 1, provider: 1, livemode: 1, paidAt: 1, planId: 1, refund: 1 } },
        )
        .toArray(),
      users
        .find({}, { projection: { name: 1, email: 1, createdAt: 1, proUntil: 1, lastLoginAt: 1 } })
        .sort({ createdAt: -1 })
        .limit(8)
        .toArray(),
      runs.countDocuments({ createdAt: { $gte: d30 } }),
    ]);

  const series = buildSeries(days, stats, signupAgg);
  const firstCounted = (await dailyStats.find({}, { projection: { _id: 1 } }).sort({ _id: 1 }).limit(1).toArray())[0]?._id;

  return {
    generatedAt: now,
    countingSince: firstCounted ?? null,
    traffic: {
      visitsToday: sumLast(series, 1, "visits"),
      visits7: sumLast(series, 7, "visits"),
      visits30: sumLast(series, 30, "visits"),
      loginsToday: sumLast(series, 1, "logins"),
      logins7: sumLast(series, 7, "logins"),
      logins30: sumLast(series, 30, "logins"),
    },
    users: {
      total: totalUsers,
      new7,
      new30,
      pro: proActive,
      free: totalUsers - proActive,
      active30,
    },
    runs30,
    revenue: summarizeRevenue(paid, now),
    series,
    recentUsers: recentUsers.map((u) => ({
      id: u._id.toHexString(),
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt ?? null,
      isPro: !!u.proUntil && u.proUntil > now,
    })),
  };
}

export type AdminStats = Awaited<ReturnType<typeof getAdminStats>>;

export interface PaymentRow {
  reference: string;
  amount: number;
  days: number;
  planId: string;
  provider: string;
  status: "paid" | "refunded";
  livemode?: boolean;
  paidAt: Date;
  refund?: { amount: number; removedDays: number; note: string; at: Date; by: string };
  email?: string;
}

/** Pagos cobrados (o reembolsados), con el correo de la cuenta. */
async function findPayments(match: Filter<OrderDoc>, limit: number) {
  const { orders } = await collections();
  return orders
    .aggregate<PaymentRow>([
      { $match: { status: { $in: ["paid", "refunded"] }, ...match } },
      { $sort: { paidAt: -1 } },
      { $limit: limit },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "u" } },
      {
        $project: {
          _id: 0,
          reference: 1,
          amount: 1,
          days: 1,
          planId: 1,
          provider: 1,
          status: 1,
          livemode: 1,
          paidAt: 1,
          refund: 1,
          email: { $arrayElemAt: ["$u.email", 0] },
        },
      },
    ])
    .toArray();
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Búsqueda del panel: por correo (o parte de él) o por referencia de pago (anz_…).
 * Sin texto, devuelve lo más reciente.
 */
export async function searchAdmin(rawQuery: string) {
  const q = rawQuery.trim().slice(0, 100);
  const { users, consents } = await collections();

  let paymentMatch: Filter<OrderDoc> = {};
  let consentMatch: Filter<ConsentDoc> = {};
  if (q) {
    const re = { $regex: escapeRe(q), $options: "i" };
    const ids = (await users.find({ email: re }, { projection: { _id: 1 } }).limit(50).toArray()).map((u) => u._id);
    paymentMatch = { $or: [{ reference: q }, { userId: { $in: ids } }] };
    // El correo guardado en la aceptación sirve aunque la cuenta ya no exista o haya cambiado de correo
    consentMatch = { $or: [{ orderRef: q }, { userId: { $in: ids } }, { email: re }] };
  }

  const [payments, consentRows, consentTotal] = await Promise.all([
    findPayments(paymentMatch, q ? 50 : 15),
    consents
      .find(consentMatch)
      .sort({ acceptedAt: -1, document: -1 })
      .limit(q ? 100 : 20)
      .toArray(),
    consents.countDocuments(),
  ]);

  return {
    query: q,
    payments,
    consents: consentRows.map((c) => ({
      id: c._id.toHexString(),
      email: c.email,
      document: c.document,
      version: c.version,
      source: c.source,
      orderRef: c.orderRef ?? null,
      acceptedAt: c.acceptedAt,
      ip: c.ip,
      userAgent: c.userAgent,
    })),
    consentTotal,
  };
}

/** Todas las aceptaciones que coinciden con la búsqueda, para exportarlas como prueba. */
export async function exportConsents(rawQuery: string) {
  const q = rawQuery.trim().slice(0, 100);
  const { users, consents } = await collections();
  let match: Filter<ConsentDoc> = {};
  if (q) {
    const re = { $regex: escapeRe(q), $options: "i" };
    const ids = (await users.find({ email: re }, { projection: { _id: 1 } }).limit(500).toArray()).map((u) => u._id);
    match = { $or: [{ orderRef: q }, { userId: { $in: ids } }, { email: re }] };
  }
  return consents.find(match).sort({ acceptedAt: -1 }).limit(10000).toArray();
}
