import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ChallengePlayer, type PublicChallengeItem } from "@/components/challenge/ChallengePlayer";
import { PageShell } from "@/components/SiteHeader";
import { getT } from "@/lib/i18n-server";
import { EXERCISE_BY_ID, localizeExercise } from "@/lib/path/content";
import { SITE } from "@/lib/site";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

async function findChallenge(code: string) {
  const { challenges } = await collections();
  return challenges.findOne({ code: decodeURIComponent(code).slice(0, 20) });
}

export async function generateMetadata(props: PageProps<"/[lang]/reto/[code]">): Promise<Metadata> {
  // Usa la base de datos: siempre por petición
  await connection();
  const { code } = await props.params;
  const { t } = await getT();
  const ch = await findChallenge(code);
  if (!ch) return { title: t("Reto", "Challenge"), robots: { index: false } };
  const n = ch.exerciseIds.length;
  const title =
    ch.creatorScore === null
      ? t(`${ch.creatorName} te reta`, `${ch.creatorName} challenges you`)
      : t(`${ch.creatorName} sacó ${ch.creatorScore}/${n}. ¿Le ganas?`, `${ch.creatorName} scored ${ch.creatorScore}/${n}. Can you beat them?`);
  return {
    title,
    description: t(
      "¿Trampa o real? Detecta las estafas en 5 mensajes y compara tu puntaje.",
      "Scam or real? Spot the scams in 5 messages and compare your score.",
    ),
    robots: { index: false },
    openGraph: { title, description: t(`Reto de ${SITE.name}: ¿trampa o real?`, `${SITE.name} challenge: scam or real?`) },
  };
}

async function Play({ params }: { params: Promise<{ code: string }> }) {
  await connection();
  const { code } = await params;
  const { lang, t } = await getT();
  const ch = await findChallenge(code);
  if (!ch)
    return (
      <div className="text-center">
        <h1 className="font-display text-3xl">{t("Este reto ya no existe", "This challenge no longer exists")}</h1>
        <p className="mt-2 text-fog">
          {t("Los retos duran 90 días. Crea uno nuevo y mándaselo a tus amigos.", "Challenges last 90 days. Create a new one and send it to your friends.")}
        </p>
        <Link href="/reto" className="btn btn-primary mt-6 h-12 px-6">
          {t("Crear un reto", "Create a challenge")}
        </Link>
      </div>
    );

  const user = await getCurrentUser();
  // Solo los datos visibles: la respuesta y la explicación se quedan en el servidor
  const items: PublicChallengeItem[] = ch.exerciseIds.flatMap((id) => {
    const found = EXERCISE_BY_ID.get(id);
    const x = found && localizeExercise(found, lang);
    return x?.kind === "veredicto" ? [{ id: x.id, channel: x.channel, from: x.from, text: x.text }] : [];
  });

  return (
    <ChallengePlayer
      code={ch.code}
      creatorName={ch.creatorName}
      creatorScore={ch.creatorScore}
      isCreator={!!user && user._id.equals(ch.creatorId)}
      loggedIn={!!user}
      items={items}
    />
  );
}

export default function RetoCodePage(props: PageProps<"/[lang]/reto/[code]">) {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-desk-3" />}>
          <Play params={props.params} />
        </Suspense>
      </div>
    </PageShell>
  );
}
