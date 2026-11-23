import { Megaphone, ShieldAlert, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { toggleMeToo } from "@/app/actions/alerts";
import { ReportForm } from "@/components/alerts/ReportForm";
import { PageShell } from "@/components/SiteHeader";
import { defang, REPORT_CHANNEL_LABEL, REPORT_CHANNELS } from "@/lib/community";
import { LOCALE } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    alternates: await alternatesFor("/alertas"),
    title: t("Alertas de estafas por WhatsApp, SMS y correo", "WhatsApp, text and email scam alerts"),
    description: t(
      "Estafas y casos de suplantación de identidad que están circulando ahora, reportados por la comunidad y revisados antes de publicarse.",
      "Scams and impersonation attempts going around right now, reported by the community and reviewed before publishing.",
    ),
  };
}

async function Feed({ searchParams }: { searchParams: PageProps<"/[lang]/alertas">["searchParams"] }) {
  await connection();
  const sp = await searchParams;
  const channel = REPORT_CHANNELS.find((c) => c === sp.canal);
  const user = await getCurrentUser();
  const { lang, t } = await getT();
  const fmt = (d: Date) => d.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "short" });
  const L = REPORT_CHANNEL_LABEL[lang];
  const { scamReports } = await collections();
  // Cada idioma ve las alertas reportadas en su idioma (las antiguas, sin idioma, son en español)
  const langFilter = lang === "en" ? { lang: "en" as const } : { lang: { $ne: "en" as const } };
  const items = await scamReports
    .find({ status: "approved", ...langFilter, ...(channel ? { channel } : {}) }, { projection: { userId: 0 } })
    .sort({ createdAt: -1 })
    .limit(40)
    .toArray();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <nav aria-label={t("Filtrar por canal", "Filter by channel")} className="mb-5 flex flex-wrap gap-2 text-sm">
          {[undefined, ...REPORT_CHANNELS].map((c) => (
            <Link
              key={c ?? "todos"}
              href={c ? `/alertas?canal=${encodeURIComponent(c)}` : "/alertas"}
              className={`rounded-full border px-3 py-1.5 ${c === channel ? "border-brand bg-brand text-white" : "border-desk-line hover:border-fog/60"}`}
            >
              {c ? L[c] : t("Todas", "All")}
            </Link>
          ))}
        </nav>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-desk-line p-10 text-center text-fog">
            {t(
              `Aún no hay alertas publicadas${channel ? ` de ${L[channel]}` : ""}. ¡Sé la primera persona en reportar una!`,
              `No alerts published yet${channel ? ` for ${L[channel]}` : ""}. Be the first to report one!`,
            )}
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((r) => {
              const mine = !!user && r.meToo.some((id) => id.equals(user._id));
              return (
                <li key={r._id.toHexString()} className="rounded-3xl border border-desk-line bg-desk-2 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="rounded-full bg-bad/15 px-2.5 py-0.5 text-xs font-semibold text-bad-text">{L[r.channel] ?? r.channel}</span>
                      <span className="text-fog">{fmt(r.createdAt)}</span>
                    </span>
                    {r.sender && <span className="break-all font-mono text-xs text-fog">{defang(r.sender)}</span>}
                  </div>
                  <p className="mt-3 whitespace-pre-line break-words leading-relaxed">{defang(r.text)}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-sm text-fog">
                      <Users className="h-4 w-4" aria-hidden />
                      {r.meToo.length + 1}{" "}
                      {r.meToo.length === 0 ? t("persona lo recibió", "person got it") : t("personas lo recibieron", "people got it")}
                    </span>
                    {user ? (
                      <form action={toggleMeToo}>
                        <input type="hidden" name="id" value={r._id.toHexString()} />
                        <button type="submit" className={`btn h-9 px-3 text-sm ${mine ? "bg-brand text-white" : "btn-ghost"}`}>
                          {mine ? t("A mí también ✓", "Me too ✓") : t("A mí también me llegó", "I got it too")}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-desk-line bg-desk-2 p-5">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <Megaphone className="h-5 w-5 text-brand" aria-hidden /> {t("Reporta una estafa", "Report a scam")}
          </h2>
          <p className="mb-4 mt-1 text-sm text-fog">
            {t("Revisamos cada reporte antes de publicarlo y nunca mostramos quién lo envió.", "We review every report before publishing it and never show who sent it.")}
          </p>
          {user ? (
            <ReportForm />
          ) : (
            <Link href="/entrar?next=/alertas" className="btn btn-primary h-11 w-full px-5 text-sm">
              {t("Entra para reportar", "Log in to report")}
            </Link>
          )}
        </div>
        <div className="rounded-3xl bg-field p-5 text-sm text-graphite">
          <p className="flex items-center gap-2 font-semibold text-chalk">
            <ShieldAlert className="h-4 w-4" aria-hidden /> {t("No toques los enlaces", "Don't touch the links")}
          </p>
          <p className="mt-1">
            {t(
              "Mostramos los enlaces “desactivados” (con [.] y hxxp) para que no se puedan abrir por error. Si fuiste víctima, llama a tu banco y denuncia ante la policía de tu país.",
              "We show links “defanged” (with [.] and hxxp) so they can't be opened by mistake. If you were a victim, call your bank and report it to your local police.",
            )}
          </p>
        </div>
      </aside>
    </div>
  );
}

export default async function AlertasPage(props: PageProps<"/[lang]/alertas">) {
  const { t } = await getT();
  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px]">
        <span className="eyebrow">{t("Comunidad", "Community")}</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{t("Estafas circulando ahora", "Scams going around now")}</h1>
        <p className="mb-10 mt-3 max-w-2xl text-lg text-fog">
          {t(
            "Mensajes reales que la gente está recibiendo, reportados por la comunidad y revisados antes de publicarse.",
            "Real messages people are receiving, reported by the community and reviewed before publishing.",
          )}
        </p>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-desk-3" />}>
          <Feed searchParams={props.searchParams} />
        </Suspense>
      </div>
    </PageShell>
  );
}
