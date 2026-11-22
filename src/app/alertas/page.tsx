import { Megaphone, ShieldAlert, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { toggleMeToo } from "@/app/actions/alerts";
import { ReportForm } from "@/components/alerts/ReportForm";
import { PageShell } from "@/components/SiteHeader";
import { defang, REPORT_CHANNELS } from "@/lib/community";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Alertas de estafas",
  description: "Estafas que están circulando ahora en El Salvador, reportadas por la comunidad y revisadas antes de publicarse.",
};

const fmt = (d: Date) => d.toLocaleDateString("es-SV", { day: "numeric", month: "short", timeZone: "America/El_Salvador" });

async function Feed({ searchParams }: { searchParams: PageProps<"/alertas">["searchParams"] }) {
  await connection();
  const sp = await searchParams;
  const channel = REPORT_CHANNELS.find((c) => c === sp.canal);
  const user = await getCurrentUser();
  const { scamReports } = await collections();
  const items = await scamReports
    .find({ status: "approved", ...(channel ? { channel } : {}) }, { projection: { userId: 0 } })
    .sort({ createdAt: -1 })
    .limit(40)
    .toArray();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <nav aria-label="Filtrar por canal" className="mb-5 flex flex-wrap gap-2 text-sm">
          {[undefined, ...REPORT_CHANNELS].map((c) => (
            <Link
              key={c ?? "todos"}
              href={c ? `/alertas?canal=${encodeURIComponent(c)}` : "/alertas"}
              className={`rounded-full border px-3 py-1.5 ${c === channel ? "border-brand bg-brand text-white" : "border-desk-line hover:border-fog/60"}`}
            >
              {c ?? "Todas"}
            </Link>
          ))}
        </nav>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-desk-line p-10 text-center text-fog">
            Aún no hay alertas publicadas{channel ? ` de ${channel}` : ""}. ¡Sé la primera persona en reportar una!
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((r) => {
              const mine = !!user && r.meToo.some((id) => id.equals(user._id));
              return (
                <li key={r._id.toHexString()} className="rounded-3xl border border-desk-line bg-desk-2 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="rounded-full bg-bad/15 px-2.5 py-0.5 text-xs font-semibold text-bad-text">{r.channel}</span>
                      <span className="text-fog">{fmt(r.createdAt)}</span>
                    </span>
                    {r.sender && <span className="break-all font-mono text-xs text-fog">{defang(r.sender)}</span>}
                  </div>
                  <p className="mt-3 whitespace-pre-line break-words leading-relaxed">{defang(r.text)}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-sm text-fog">
                      <Users className="h-4 w-4" aria-hidden />
                      {r.meToo.length + 1} {r.meToo.length === 0 ? "persona lo recibió" : "personas lo recibieron"}
                    </span>
                    {user ? (
                      <form action={toggleMeToo}>
                        <input type="hidden" name="id" value={r._id.toHexString()} />
                        <button type="submit" className={`btn h-9 px-3 text-sm ${mine ? "bg-brand text-white" : "btn-ghost"}`}>
                          {mine ? "A mí también ✓" : "A mí también me llegó"}
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
            <Megaphone className="h-5 w-5 text-brand" aria-hidden /> Reporta una estafa
          </h2>
          <p className="mb-4 mt-1 text-sm text-fog">Revisamos cada reporte antes de publicarlo y nunca mostramos quién lo envió.</p>
          {user ? (
            <ReportForm />
          ) : (
            <Link href="/entrar?next=/alertas" className="btn btn-primary h-11 w-full px-5 text-sm">
              Entra para reportar
            </Link>
          )}
        </div>
        <div className="rounded-3xl bg-field p-5 text-sm text-graphite">
          <p className="flex items-center gap-2 font-semibold text-chalk">
            <ShieldAlert className="h-4 w-4" aria-hidden /> No toques los enlaces
          </p>
          <p className="mt-1">
            Mostramos los enlaces “desactivados” (con [.] y hxxp) para que no se puedan abrir por error. Si fuiste víctima,
            llama a tu banco y denuncia ante la Policía Nacional Civil.
          </p>
        </div>
      </aside>
    </div>
  );
}

export default function AlertasPage(props: PageProps<"/alertas">) {
  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px]">
        <span className="eyebrow">Comunidad</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Estafas circulando ahora</h1>
        <p className="mb-10 mt-3 max-w-2xl text-lg text-fog">
          Mensajes reales que la gente está recibiendo en El Salvador, reportados por la comunidad y revisados antes de
          publicarse.
        </p>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-desk-3" />}>
          <Feed searchParams={props.searchParams} />
        </Suspense>
      </div>
    </PageShell>
  );
}
