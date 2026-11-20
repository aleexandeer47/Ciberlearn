import { Check } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PlanPicker } from "@/components/billing/PlanPicker";
import { PageShell } from "@/components/SiteHeader";
import { FEATURES } from "@/lib/plans";
import { getCurrentUser } from "@/lib/server/session";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Planes",
  description: "Gratis para empezar, Pro para entrenar en serio. Precios en dólares, pago con tarjeta.",
};

const FAQ = [
  ["¿Se renueva solo?", "No. Pagas una vez y tienes Pro por 30 días o un año. La fecha de vencimiento aparece en tu progreso, y si pagas de nuevo los días se suman."],
  ["¿Cómo pago?", "Con tarjeta de crédito o débito por medio de Wompi, la pasarela de Banco Agrícola. No guardamos los datos de tu tarjeta."],
  ["¿El certificado es oficial?", "Es un certificado interno de finalización: demuestra que completaste el entrenamiento, pero no es una certificación profesional acreditada."],
  ["¿Y para mi empresa o colegio?", "Estamos preparando planes por equipo con panel e informes. Escríbenos y te avisamos primero."],
];

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-chalk" strokeWidth={2} aria-label="Incluido" />;
  if (v === false) return <span className="text-fog/40">—</span>;
  return <span className="text-sm">{v}</span>;
}

async function CurrentPlan() {
  const user = await getCurrentUser();
  return (
    <>
      {user?.isPro && (
        <p className="mx-auto mb-8 w-max rounded-full bg-ok/15 px-4 py-2 text-sm text-ok">
          Tienes Pro hasta el {user.proUntil!.toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}
      <PlanPicker proUntil={user?.proUntil?.toISOString() ?? null} />
    </>
  );
}

export default function PlanesPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="eyebrow">Planes</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">Una estafa cuesta más que esto</h1>
          <p className="mt-4 text-fog">
            Empieza gratis. Pasa a Pro cuando quieras entrenar con mensajes más difíciles, contra el reloj y con tu progreso completo.
          </p>
        </div>

        <Suspense fallback={<div className="h-[560px]" />}>
          <CurrentPlan />
        </Suspense>

        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold">Comparación completa</h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-desk-line">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-desk-2 text-fog">
                <tr>
                  <th className="px-5 py-3 font-medium">Función</th>
                  <th className="px-5 py-3 text-center font-medium">Gratis</th>
                  <th className="px-5 py-3 text-center font-medium text-accent">Pro</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f.label} className="border-t border-desk-line">
                    <td className="px-5 py-3.5">{f.label}</td>
                    <td className="px-5 py-3.5 text-center">
                      <Cell v={f.free} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Cell v={f.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-2">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-desk-line bg-desk-2 p-5 open:border-fog/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {q}
                <span className="text-fog transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-fog">{a}</p>
            </details>
          ))}
        </section>

        <section className="mt-16 flex flex-col items-start justify-between gap-4 rounded-3xl border border-dashed border-desk-line p-7 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl font-semibold">Equipos y colegios</h2>
            <p className="mt-1 text-fog">Panel, informes y escenarios a la medida de tu organización.</p>
          </div>
          {SITE.contactEmail ? (
            <a href={`mailto:${SITE.contactEmail}`} className="btn btn-ghost px-6 py-3">
              Hablar con nosotros
            </a>
          ) : (
            <span className="rounded-full border border-desk-line px-6 py-3 text-sm text-fog">Próximamente</span>
          )}
        </section>
      </div>
    </PageShell>
  );
}
