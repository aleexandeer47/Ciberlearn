import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ReadinessGauge, ReadinessHistory, ReadinessParts } from "@/components/business/Readiness";
import { PrintButton } from "@/components/progress/PrintButton";
import { Logo, PageShell } from "@/components/SiteHeader";
import { AREAS, PHISH_BY_ID, pct, recommendations } from "@/lib/business";
import { collections } from "@/lib/server/db";
import { recordReadiness, teamReport } from "@/lib/server/org";
import { getCurrentUser } from "@/lib/server/session";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Informe de capacitación", robots: { index: false } };

const fmt = (d: Date) => d.toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" });

async function Report() {
  await connection();
  const user = await getCurrentUser();
  if (!user?.org || user.org.role !== "owner") redirect("/empresa");
  const { orgs } = await collections();
  const org = await orgs.findOne({ _id: user.org._id, ownerId: user._id });
  if (!org) redirect("/empresa");

  const r = await teamReport(org._id);
  const history = await recordReadiness(org._id, r.readiness);
  const recs = recommendations(r.readinessInput, r.skills[0]?.label ?? null, r.rows.filter((m) => !m.area).length);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <Link href="/empresa" className="text-sm text-fog hover:text-chalk">
          ← Volver al panel
        </Link>
        <PrintButton />
      </div>

      <article className="space-y-8 rounded-3xl bg-paper p-8 text-ink ring-1 ring-line sm:p-12 print:rounded-none print:p-0 print:ring-0">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Logo /> {SITE.name}
            </div>
            <h1 className="mt-4 font-display text-3xl">Informe de capacitación contra phishing</h1>
            <p className="mt-1 text-ink-2">{org.name}</p>
          </div>
          <p className="text-sm text-ink-3">Generado el {fmt(new Date())}</p>
        </header>

        <section className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
          <div className="text-center">
            <p className="mb-2 text-sm text-ink-3">Índice de preparación</p>
            <ReadinessGauge score={r.readiness} size={180} />
          </div>
          <ReadinessParts input={r.readinessInput} track="bg-[#e2e8f0]" />
        </section>

        <section>
          <h2 className="font-display text-xl">Resumen</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              ["Personas", `${org.memberCount} de ${org.seats} puestos`],
              ["Avance de la ruta", `${r.pathPct}%`],
              ["Bandeja (promedio)", r.inboxScore === null ? "—" : `${r.inboxScore}/100`],
              ["Simulacros", r.sims.sent ? `${r.sims.rate}% cayó · ${r.sims.reportRate}% reportó` : "—"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-line p-3">
                <dt className="text-ink-3">{k}</dt>
                <dd className="mt-1 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {recs.length > 0 && (
          <section>
            <h2 className="font-display text-xl">Recomendaciones</h2>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px]">
              {recs.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          </section>
        )}

        <section className="break-inside-avoid">
          <h2 className="font-display text-xl">Evolución mensual</h2>
          <div className="mt-3">
            <ReadinessHistory history={history} />
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl">Equipo</h2>
          <table className="mt-3 w-full text-left text-[13px]">
            <thead className="border-b border-line text-ink-3">
              <tr>
                <th className="py-2 pr-2 font-medium">Persona</th>
                <th className="px-2 py-2 font-medium">Área</th>
                <th className="px-2 py-2 font-medium">Ruta</th>
                <th className="px-2 py-2 font-medium">Bandeja</th>
                <th className="px-2 py-2 font-medium">Simulacros</th>
                <th className="py-2 pl-2 font-medium">Punto débil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {r.rows.map((m) => (
                <tr key={m.id} className="break-inside-avoid">
                  <td className="py-2 pr-2">{m.name}</td>
                  <td className="px-2 py-2">{m.area ? AREAS[m.area].label : "—"}</td>
                  <td className="px-2 py-2 tabular-nums">{pct(m.lessonsDone, r.totalLessons)}%</td>
                  <td className="px-2 py-2 tabular-nums">{m.inboxAvg ?? "—"}</td>
                  <td className="px-2 py-2">
                    {m.simsSent ? `cayó ${m.simsClicked}/${m.simsSent}${m.simsReported ? `, reportó ${m.simsReported}` : ""}` : "—"}
                  </td>
                  <td className="py-2 pl-2">{m.weakest ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {r.campaigns.length > 0 && (
          <section className="break-inside-avoid">
            <h2 className="font-display text-xl">Simulacros</h2>
            <table className="mt-3 w-full text-left text-[13px]">
              <thead className="border-b border-line text-ink-3">
                <tr>
                  <th className="py-2 pr-2 font-medium">Fecha</th>
                  <th className="px-2 py-2 font-medium">Plantilla</th>
                  <th className="px-2 py-2 font-medium">Enviados</th>
                  <th className="px-2 py-2 font-medium">Clics</th>
                  <th className="py-2 pl-2 font-medium">Reportes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {r.campaigns.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 pr-2">{fmt(c.createdAt)}</td>
                    <td className="px-2 py-2">{PHISH_BY_ID.get(c.templateId)?.title ?? c.templateId}</td>
                    <td className="px-2 py-2 tabular-nums">{c.sent}</td>
                    <td className="px-2 py-2 tabular-nums">{pct(c.clicked, c.sent)}%</td>
                    <td className="py-2 pl-2 tabular-nums">{pct(c.reported, c.sent)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <footer className="border-t border-line pt-4 text-xs text-ink-3">
          Informe interno de {SITE.name}. Contiene datos personales del equipo: compártelo solo con quien lo necesite para la
          capacitación.
        </footer>
      </article>
    </div>
  );
}

export default function InformeImprimirPage() {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-[80vh] max-w-4xl animate-pulse rounded-3xl bg-desk-3" />}>
        <Report />
      </Suspense>
    </PageShell>
  );
}
