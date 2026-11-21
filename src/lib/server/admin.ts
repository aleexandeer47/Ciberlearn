import "server-only";
import { buildSeries, summarizeRevenue, sumLast } from "@/lib/adminStats";
import { lastDays, TZ } from "@/lib/dayKey";
import { collections } from "./db";

/** Todo lo que muestra el panel de administración, en una sola consulta en paralelo. */
export async function getAdminStats(now = new Date()) {
  const { users, runs, orders, dailyStats } = await collections();
  const d7 = new Date(now.getTime() - 7 * 864e5);
  const d30 = new Date(now.getTime() - 30 * 864e5);
  const days = lastDays(30, now);

  const [totalUsers, new7, new30, proActive, active30, stats, signupAgg, paid, recentUsers, recentPaid, runs30] =
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
        .find({ status: "paid" }, { projection: { amount: 1, provider: 1, livemode: 1, paidAt: 1, planId: 1 } })
        .toArray(),
      users
        .find({}, { projection: { name: 1, email: 1, createdAt: 1, proUntil: 1, lastLoginAt: 1 } })
        .sort({ createdAt: -1 })
        .limit(8)
        .toArray(),
      orders
        .aggregate<{ reference: string; amount: number; planId: string; provider: string; livemode?: boolean; paidAt: Date; email?: string }>([
          { $match: { status: "paid" } },
          { $sort: { paidAt: -1 } },
          { $limit: 8 },
          { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "u" } },
          {
            $project: {
              reference: 1,
              amount: 1,
              planId: 1,
              provider: 1,
              livemode: 1,
              paidAt: 1,
              email: { $arrayElemAt: ["$u.email", 0] },
            },
          },
        ])
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
    recentPaid,
  };
}

export type AdminStats = Awaited<ReturnType<typeof getAdminStats>>;
