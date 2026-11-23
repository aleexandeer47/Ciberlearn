import { BookOpen, Flame, ShieldCheck, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageShell } from "@/components/SiteHeader";
import { LOCALE } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { achievementByShareId } from "@/lib/server/achievement";
import { SITE } from "@/lib/site";

export async function generateMetadata(props: PageProps<"/[lang]/logro/[id]">): Promise<Metadata> {
  // Usa la base de datos y la fecha actual: siempre por petición
  await connection();
  const { id } = await props.params;
  const { lang, t } = await getT();
  const a = await achievementByShareId(id, lang);
  if (!a) return { title: t("Logro", "Achievement"), robots: { index: false } };
  const title = t(`${a.name} es nivel ${a.level.name} en ${SITE.name}`, `${a.name} is level ${a.level.name} on ${SITE.name}`);
  return {
    title,
    description: t("Aprende a detectar estafas digitales, gratis.", "Learn to spot online scams, for free."),
    robots: { index: false },
    openGraph: { title },
  };
}

async function Card({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const { lang, t } = await getT();
  const a = await achievementByShareId(id, lang);
  if (!a)
    return (
      <div className="text-center">
        <h1 className="font-display text-3xl">{t("Esta tarjeta ya no está disponible", "This card is no longer available")}</h1>
        <Link href="/" className="btn btn-primary mt-6 h-12 px-6">
          {t(`Conocer ${SITE.name}`, `Discover ${SITE.name}`)}
        </Link>
      </div>
    );

  const stats = [
    { icon: Zap, label: "XP", value: a.xp.toLocaleString(LOCALE[lang]) },
    { icon: BookOpen, label: t("Lecciones", "Lessons"), value: `${a.lessons}/${a.totalLessons}` },
    {
      icon: Flame,
      label: t("Mejor racha", "Best streak"),
      value: `${a.bestStreak} ${a.bestStreak === 1 ? t("día", "day") : t("días", "days")}`,
    },
  ];

  return (
    <div className="text-center">
      <div className="rounded-3xl bg-[linear-gradient(135deg,#0a0f1c_0%,#102a5c_60%,#2563eb_130%)] p-8 text-white sm:p-12">
        <ShieldCheck className="mx-auto h-14 w-14 text-[#93c5fd]" strokeWidth={1.5} aria-hidden />
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-[#93c5fd]">{t("Detective de estafas", "Scam detective")}</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{a.name}</h1>
        <p className="mt-3 text-xl">
          {t("Nivel", "Level")} {a.level.index}: <strong>{a.level.name}</strong>
        </p>
        <dl className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/10 p-3">
              <s.icon className="mx-auto h-5 w-5 text-[#fbbf24]" aria-hidden />
              <dd className="mt-1 font-display text-xl tabular-nums">{s.value}</dd>
              <dt className="text-xs text-[#cbd5e1]">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
      <p className="mt-8 text-lg text-fog">{t("¿Tú detectarías una estafa a tiempo?", "Would you spot a scam in time?")}</p>
      <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/diaria" className="btn btn-primary h-12 px-6">
          {t("Probar la estafa del día", "Try the scam of the day")}
        </Link>
        <Link href="/ruta" className="btn btn-ghost h-12 px-6">
          {t("Empezar la ruta gratis", "Start the free path")}
        </Link>
      </div>
    </div>
  );
}

export default function LogroPage(props: PageProps<"/[lang]/logro/[id]">) {
  return (
    <PageShell>
      <div className="mx-auto max-w-xl">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-desk-3" />}>
          <Card params={props.params} />
        </Suspense>
      </div>
    </PageShell>
  );
}
