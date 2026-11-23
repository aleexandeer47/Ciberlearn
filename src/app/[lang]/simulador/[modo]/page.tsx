import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { PageShell } from "@/components/SiteHeader";
import { Simulator } from "@/components/simulator/Simulator";
import { getT } from "@/lib/i18n-server";
import { MODE_INFO, scenariosFor } from "@/lib/scenarios/packs";
import { collections } from "@/lib/server/db";
import type { RunMode } from "@/lib/server/models";
import { getCurrentUser } from "@/lib/server/session";
import { computeStats } from "@/lib/stats";

const PRO_MODES = ["pro", "contrarreloj", "entrenamiento"] as const;
type ProMode = (typeof PRO_MODES)[number];

export function generateStaticParams() {
  return PRO_MODES.map((modo) => ({ modo }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Modo Pro", "Pro mode"), robots: { index: false } };
}

async function ModeRunner({ params }: { params: Promise<{ modo: string }> }) {
  const { modo } = await params;
  if (!(PRO_MODES as readonly string[]).includes(modo)) notFound();
  const mode = modo as ProMode;
  const { lang, t } = await getT();

  const INTRO: Record<ProMode, string> = {
    pro: t(
      "Seis mensajes más difíciles: fraudes a empresas, compraventas, billeteras y avisos reales que parecen falsos.",
      "Six harder messages: business fraud, marketplace sales, wallets and real notices that look fake.",
    ),
    contrarreloj: t(
      "Tienes 40 segundos por mensaje. Si se acaba el tiempo, cuenta como fallo. Así se siente un ataque real.",
      "You get 40 seconds per message. If time runs out, it counts as a miss. That's how a real attack feels.",
    ),
    entrenamiento: t(
      "Una ronda armada con los mensajes que más practican tu punto débil.",
      "A round built from the messages that best practice your weak spot.",
    ),
  };

  const user = await getCurrentUser();
  if (!user) redirect(`/entrar?next=/simulador/${mode}`);

  if (!user.isPro) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-desk-line bg-desk-2 p-8 text-center">
        <span className="rounded-full bg-brand px-2.5 py-1 font-mono text-[10px] font-semibold text-white">Pro</span>
        <h1 className="mt-4 font-display text-3xl font-semibold">{MODE_INFO[mode].title[lang]}</h1>
        <p className="mt-3 text-fog">{INTRO[mode]}</p>
        <Link href="/planes" className="btn btn-primary mt-8 px-7 py-3.5">
          {t("Desbloquear con Pro", "Unlock with Pro")}
        </Link>
      </div>
    );
  }

  let weakest = null;
  if (mode === "entrenamiento") {
    const { runs } = await collections();
    const docs = await runs.find({ userId: user._id }).sort({ createdAt: -1 }).limit(100).toArray();
    weakest = computeStats(docs, lang).weakest;
  }
  const scenarios = scenariosFor(mode as RunMode, weakest?.category, lang);

  return (
    <>
      <div className="mx-auto mb-8 max-w-6xl">
        <p className="eyebrow">{t("Modo Pro", "Pro mode")}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">
          {MODE_INFO[mode].title[lang]}
          {weakest && <span className="text-fog">: {weakest.label}</span>}
        </h1>
        <p className="mt-2 max-w-2xl text-fog">{INTRO[mode]}</p>
      </div>
      <Simulator scenarios={scenarios} mode={mode} seconds={MODE_INFO[mode].seconds} />
    </>
  );
}

export default function ModoPage(props: PageProps<"/[lang]/simulador/[modo]">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-[70vh] max-w-6xl animate-pulse rounded-3xl bg-desk-2/50" />}>
        <ModeRunner params={props.params} />
      </Suspense>
    </PageShell>
  );
}
