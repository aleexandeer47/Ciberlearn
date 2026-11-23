import { Check } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PlanPicker } from "@/components/billing/PlanPicker";
import { PageShell } from "@/components/SiteHeader";
import { LOCALE, type Lang } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { FEATURES } from "@/lib/plans";
import { getCurrentUser } from "@/lib/server/session";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("Planes", "Pricing"),
    description: t(
      "Gratis para empezar, Pro para entrenar en serio. Precios en dólares, pago con tarjeta.",
      "Free to start, Pro to train for real. Prices in US dollars, pay by card.",
    ),
  };
}

function Cell({ v, lang }: { v: boolean | Record<Lang, string>; lang: Lang }) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-chalk" strokeWidth={2} aria-label={lang === "en" ? "Included" : "Incluido"} />;
  if (v === false) return <span className="text-fog/40">—</span>;
  return <span className="text-sm">{v[lang]}</span>;
}

async function CurrentPlan() {
  const [user, { lang, t }] = await Promise.all([getCurrentUser(), getT()]);
  return (
    <>
      {user?.isPro && (
        <p className="mx-auto mb-8 w-max rounded-full bg-ok/15 px-4 py-2 text-sm text-ok">
          {t("Tienes Pro hasta el", "You have Pro until")}{" "}
          {user.proEnds!.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "long", year: "numeric" })}
          {user.org?.active && ` · ${t("por", "via")} ${user.org.name}`}
        </p>
      )}
      <PlanPicker proUntil={user?.proUntil?.toISOString() ?? null} />
    </>
  );
}

export default async function PlanesPage() {
  const { lang, t } = await getT();
  const FAQ = [
    [
      t("¿Se renueva solo?", "Does it renew automatically?"),
      t(
        "No. Pagas una vez y tienes Pro por 30 días o un año. La fecha de vencimiento aparece en tu progreso, y si pagas de nuevo los días se suman.",
        "No. You pay once and get Pro for 30 days or a year. The expiry date shows in your progress, and if you pay again the days are added.",
      ),
    ],
    [
      t("¿Cómo pago?", "How do I pay?"),
      t(
        "Con tarjeta de crédito o débito por medio de Wompi, una pasarela de pagos segura. Los precios están en dólares estadounidenses. No guardamos los datos de tu tarjeta.",
        "With a credit or debit card through Wompi, a secure payment gateway. Prices are in US dollars. We never store your card details.",
      ),
    ],
    [
      t("¿El certificado es oficial?", "Is the certificate official?"),
      t(
        "Es un certificado interno de finalización: demuestra que completaste el entrenamiento, pero no es una certificación profesional acreditada.",
        "It's an internal certificate of completion: it shows you completed the training, but it isn't an accredited professional certification.",
      ),
    ],
    [
      t("¿Y para mi empresa o colegio?", "What about my company or school?"),
      t(
        "Con el plan Empresa cada persona de tu equipo recibe Pro, y tú ves su avance, descargas informes y envías simulacros de phishing. Para colegios, el modo clase es gratis.",
        "With the Business plan everyone on your team gets Pro, and you see their progress, download reports and send phishing drills. For schools, class mode is free.",
      ),
    ],
  ];
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="eyebrow">{t("Planes", "Pricing")}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {t("Una estafa cuesta más que esto", "A scam costs more than this")}
          </h1>
          <p className="mt-4 text-fog">
            {t(
              "Empieza gratis. Pasa a Pro cuando quieras entrenar con mensajes más difíciles, contra el reloj y con tu progreso completo.",
              "Start for free. Upgrade to Pro when you want to train with harder messages, against the clock and with your full progress.",
            )}
          </p>
        </div>

        <Suspense fallback={<div className="h-[560px]" />}>
          <CurrentPlan />
        </Suspense>

        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold">{t("Comparación completa", "Full comparison")}</h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-desk-line">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-desk-2 text-fog">
                <tr>
                  <th className="px-5 py-3 font-medium">{t("Función", "Feature")}</th>
                  <th className="px-5 py-3 text-center font-medium">{t("Gratis", "Free")}</th>
                  <th className="px-5 py-3 text-center font-medium text-accent">Pro</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f.label.es} className="border-t border-desk-line">
                    <td className="px-5 py-3.5">{f.label[lang]}</td>
                    <td className="px-5 py-3.5 text-center">
                      <Cell v={f.free} lang={lang} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Cell v={f.pro} lang={lang} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-fog">
            {t(
              "Los chats con IA y “¿Es estafa?” llegarán pronto para Pro, con un uso justo de hasta 30 por día.",
              "AI chats and “Is it a scam?” are coming soon to Pro, with fair use of up to 30 a day.",
            )}
          </p>
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

      </div>
    </PageShell>
  );
}
