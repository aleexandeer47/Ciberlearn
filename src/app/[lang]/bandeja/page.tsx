import { Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { InboxTrainer } from "@/components/inbox/InboxTrainer";
import { PageShell } from "@/components/SiteHeader";
import { LOCALE } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    alternates: await alternatesFor("/bandeja"),
    title: t("Bandeja de entrenamiento", "Training inbox"),
    description: t(
      "Un correo simulado con mensajes reales y trampas: reporta, elimina o confía, como en tu trabajo.",
      "A simulated inbox with real messages and traps: report, delete or trust, just like at work.",
    ),
  };
}

async function Trainer() {
  const [user, { lang, t }] = await Promise.all([getCurrentUser(), getT()]);
  if (!user)
    return (
      <Gate
        title={t("Entra para usar la bandeja", "Log in to use the inbox")}
        cta={{ href: "/registro?next=/bandeja", label: t("Crear cuenta gratis", "Sign up free") }}
      >
        {t("La bandeja de entrenamiento es parte del plan Pro.", "The training inbox is part of the Pro plan.")}
      </Gate>
    );
  if (!user.isPro)
    return (
      <Gate title={t("Exclusivo del plan Pro", "Pro plan only")} cta={{ href: "/planes", label: t("Ver plan Pro", "See Pro plan") }}>
        {t(
          "Practica con un correo simulado: 8 mensajes por bandeja, mezcla de reales y trampas, y una calificación detallada.",
          "Practice with a simulated inbox: 8 messages each time, a mix of real ones and traps, and a detailed score.",
        )}
      </Gate>
    );

  const { inboxResults } = await collections();
  const history = await inboxResults.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).toArray();
  return (
    <div className="space-y-8">
      <InboxTrainer />
      {history.length > 0 && (
        <section>
          <h2 className="font-display text-xl">{t("Tus últimas bandejas", "Your latest inboxes")}</h2>
          <ul className="mt-3 divide-y divide-desk-line rounded-2xl border border-desk-line bg-desk-2 text-sm">
            {history.map((h) => (
              <li key={h._id.toHexString()} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <span className="text-fog">{h.createdAt.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "short" })}</span>
                <span>
                  <strong className="tabular-nums">{h.score}</strong>/100 ·{" "}
                  {t(
                    `reportaste ${h.reported} de ${h.phishing} · ${h.clicked} clics`,
                    `you reported ${h.reported} of ${h.phishing} · ${h.clicked} clicks`,
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Gate({ title, cta, children }: { title: string; cta: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-desk-line bg-desk-2 p-8 text-center">
      <Lock className="mx-auto h-8 w-8 text-fog" aria-hidden />
      <h2 className="mt-3 font-display text-2xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-fog">{children}</p>
      <Link href={cta.href} className="btn btn-primary mt-6 h-12 px-6">
        {cta.label}
      </Link>
    </div>
  );
}

export default async function BandejaPage() {
  const { t } = await getT();
  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px]">
        <span className="eyebrow">{t("Entrenamiento · Pro", "Training · Pro")}</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{t("Bandeja de entrenamiento", "Training inbox")}</h1>
        <p className="mb-8 mt-3 max-w-2xl text-lg text-fog">
          {t(
            "Así se ve un día normal de correo. Decide qué haces con cada mensaje: lo ideal es reportar las trampas, no solo borrarlas.",
            "This is what a normal day of email looks like. Decide what to do with each message: ideally, report the traps instead of just deleting them.",
          )}
        </p>
        <Suspense fallback={<div className="h-[560px] animate-pulse rounded-3xl bg-desk-3" />}>
          <Trainer />
        </Suspense>
      </div>
    </PageShell>
  );
}
