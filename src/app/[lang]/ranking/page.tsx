import { Crown, Medal, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ProfileForm } from "@/components/ranking/ProfileForm";
import { PageShell } from "@/components/SiteHeader";
import { LOCALE } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { countryName, countryOptions, publicName, weekStart } from "@/lib/ranking";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    alternates: await alternatesFor("/ranking"),
    title: t("Ranking mundial", "Global leaderboard"),
    description: t("Quiénes detectan más estafas: XP de la semana y de todos los tiempos.", "Who spots the most scams: XP this week and of all time."),
  };
}

interface Row {
  id: string;
  name: string;
  country: string;
  xp: number;
}

async function getBoard(period: "semana" | "total") {
  const { users, xpEvents } = await collections();
  if (period === "total") {
    const docs = await users
      .find({ xp: { $gt: 0 }, showInRanking: { $ne: false } }, { projection: { nickname: 1, country: 1, xp: 1 } })
      .sort({ xp: -1, _id: 1 })
      .limit(50)
      .toArray();
    return docs.map<Row>((u) => ({ id: u._id.toHexString(), name: publicName(u), country: u.country ?? "OT", xp: u.xp ?? 0 }));
  }
  const rows = await xpEvents
    .aggregate<{ _id: unknown; xp: number; u: { _id: { toHexString(): string }; nickname?: string; country?: string; showInRanking?: boolean }[] }>([
      { $match: { createdAt: { $gte: weekStart() } } },
      { $group: { _id: "$userId", xp: { $sum: "$amount" } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "u" } },
      { $match: { "u.showInRanking": { $ne: false }, "u.0": { $exists: true } } },
      { $sort: { xp: -1, _id: 1 } },
      { $limit: 50 },
    ])
    .toArray();
  return rows.map<Row>((r) => ({ id: r.u[0]._id.toHexString(), name: publicName(r.u[0]), country: r.u[0].country ?? "OT", xp: r.xp }));
}

async function Board({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  // La semana depende de la hora actual: siempre por petición.
  await connection();
  const period = sp.periodo === "total" ? "total" : "semana";
  const [rows, user, { lang, t }] = await Promise.all([getBoard(period), getCurrentUser(), getT()]);
  const loc = LOCALE[lang];

  let me: { name: string; country: string; show: boolean; xp: number; pos: number | null } | null = null;
  if (user) {
    const { users, xpEvents } = await collections();
    const doc = await users.findOne({ _id: user._id }, { projection: { nickname: 1, country: 1, showInRanking: 1, xp: 1 } });
    const total = doc?.xp ?? 0;
    let xp = total;
    let pos: number | null = null;
    if (period === "total") {
      pos = total > 0 ? (await users.countDocuments({ xp: { $gt: total }, showInRanking: { $ne: false } })) + 1 : null;
    } else {
      const mine = await xpEvents
        .aggregate<{ xp: number }>([{ $match: { userId: user._id, createdAt: { $gte: weekStart() } } }, { $group: { _id: null, xp: { $sum: "$amount" } } }])
        .toArray();
      xp = mine[0]?.xp ?? 0;
      const i = rows.findIndex((r) => r.id === user.id);
      pos = i >= 0 ? i + 1 : null;
    }
    me = { name: doc ? publicName(doc) : "", country: doc?.country ?? "OT", show: doc?.showInRanking !== false, xp, pos };
  }

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);
  const medal = ["text-[#f59e0b]", "text-[#94a3b8]", "text-[#b45309]"];

  return (
    <div className="mx-auto grid max-w-[1100px] gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <span className="eyebrow">{t("Ranking mundial", "Global leaderboard")}</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{t("Quién detecta más estafas", "Who spots the most scams")}</h1>
        <p className="mt-3 max-w-xl text-lg text-fog">
          {t("Ganas XP con la ruta, el simulador y los chats con IA.", "You earn XP with the path, the simulator and the AI chats.")}
        </p>

        <div className="mt-8 inline-flex rounded-xl border border-desk-line bg-desk-2 p-1" role="tablist">
          {(
            [
              ["semana", t("Esta semana", "This week")],
              ["total", t("Todos los tiempos", "All time")],
            ] as const
          ).map(([p, label]) => (
            <Link
              key={p}
              href={p === "semana" ? "/ranking" : "/ranking?periodo=total"}
              role="tab"
              aria-selected={period === p}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${period === p ? "bg-brand text-white" : "text-fog hover:text-chalk"}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-desk-line p-10 text-center">
            <Trophy className="mx-auto h-10 w-10 text-fog" strokeWidth={1.5} aria-hidden />
            <p className="mt-4 font-semibold">
              {period === "semana" ? t("Nadie ha sumado XP esta semana", "Nobody has earned XP this week") : t("Nadie ha sumado XP todavía", "Nobody has earned XP yet")}
            </p>
            <p className="mt-1 text-sm text-fog">{t("Completa una lección y aparece primero.", "Finish a lesson and be the first.")}</p>
            <Link href="/ruta" className="btn btn-primary mt-6 h-11 px-5">
              {t("Ir a la ruta", "Go to the path")}
            </Link>
          </div>
        ) : (
          <>
            {/* Podio */}
            <ol className="mt-8 grid gap-3 sm:grid-cols-3">
              {podium.map((r, i) => (
                <li
                  key={r.id}
                  className={`rounded-3xl border p-5 text-center ${r.id === user?.id ? "border-brand bg-field" : "border-desk-line bg-desk-2"} ${i === 0 ? "sm:order-2 sm:-mt-4" : i === 1 ? "sm:order-1" : "sm:order-3"}`}
                >
                  {i === 0 ? (
                    <Crown className={`mx-auto h-8 w-8 ${medal[i]}`} strokeWidth={1.75} aria-hidden />
                  ) : (
                    <Medal className={`mx-auto h-8 w-8 ${medal[i]}`} strokeWidth={1.75} aria-hidden />
                  )}
                  <p className="mt-2 text-sm text-fog">#{i + 1}</p>
                  <p className="mt-1 truncate font-semibold">{r.name}</p>
                  <p className="text-xs text-fog">{countryName(r.country, lang)}</p>
                  <p className="mt-3 font-display text-3xl tabular-nums">{r.xp.toLocaleString(loc)}</p>
                  <p className="text-xs text-fog">XP</p>
                </li>
              ))}
            </ol>

            {rest.length > 0 && (
              <ol start={4} className="mt-6 divide-y divide-desk-line overflow-hidden rounded-3xl border border-desk-line bg-desk-2">
                {rest.map((r, i) => (
                  <li key={r.id} className={`flex items-center gap-4 px-5 py-3 ${r.id === user?.id ? "bg-field" : ""}`}>
                    <span className="w-8 font-mono text-sm text-fog">#{i + 4}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{r.name}</span>
                      <span className="text-xs text-fog">{countryName(r.country, lang)}</span>
                    </span>
                    <span className="font-semibold tabular-nums">{r.xp.toLocaleString(loc)} XP</span>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {me ? (
          <>
            <div className="rounded-3xl bg-brand p-6 text-white">
              <p className="text-sm opacity-80">
                {period === "semana" ? t("Tu posición esta semana", "Your position this week") : t("Tu posición global", "Your overall position")}
              </p>
              <p className="mt-1 font-display text-5xl">{me.pos ? `#${me.pos}` : "—"}</p>
              <p className="mt-2 opacity-90">
                {me.xp.toLocaleString(loc)} XP{!me.show && t(" · oculto del ranking", " · hidden from the leaderboard")}
              </p>
              {!me.pos && me.show && <p className="mt-2 text-sm opacity-80">{t("Gana XP para aparecer.", "Earn XP to show up.")}</p>}
            </div>
            <div className="rounded-3xl border border-desk-line bg-desk-2 p-6">
              <h2 className="font-display text-xl">{t("Tu perfil público", "Your public profile")}</h2>
              <div className="mt-4">
                <ProfileForm nickname={me.name} country={me.country} show={me.show} countries={countryOptions(lang)} />
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl bg-field p-6">
            <p className="font-semibold">{t("Entra al ranking", "Join the leaderboard")}</p>
            <p className="mt-1 text-sm text-graphite">
              {t("Crea tu cuenta gratis, elige un apodo y empieza a sumar XP.", "Create your free account, pick a nickname and start earning XP.")}
            </p>
            <Link href="/registro?next=/ranking" className="btn btn-primary mt-4 h-11 w-full">
              {t("Crear cuenta gratis", "Sign up free")}
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

export default function RankingPage(props: PageProps<"/[lang]/ranking">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-[70vh] max-w-[1100px] animate-pulse rounded-3xl bg-desk-3" />}>
        <Board searchParams={props.searchParams as Promise<Record<string, string | string[] | undefined>>} />
      </Suspense>
    </PageShell>
  );
}
