import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ChallengePlayer, type PublicChallengeItem } from "@/components/challenge/ChallengePlayer";
import { PageShell } from "@/components/SiteHeader";
import { EXERCISE_BY_ID } from "@/lib/path/content";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

async function findChallenge(code: string) {
  const { challenges } = await collections();
  return challenges.findOne({ code: decodeURIComponent(code).slice(0, 20) });
}

export async function generateMetadata(props: PageProps<"/reto/[code]">): Promise<Metadata> {
  // Usa la base de datos: siempre por petición
  await connection();
  const { code } = await props.params;
  const ch = await findChallenge(code);
  if (!ch) return { title: "Reto", robots: { index: false } };
  const title = ch.creatorScore === null ? `${ch.creatorName} te reta` : `${ch.creatorName} sacó ${ch.creatorScore}/${ch.exerciseIds.length}. ¿Le ganas?`;
  return {
    title,
    description: "¿Trampa o real? Detecta las estafas en 5 mensajes y compara tu puntaje.",
    robots: { index: false },
    openGraph: { title, description: "Reto de Ciberlearn: ¿trampa o real?" },
  };
}

async function Play({ params }: { params: Promise<{ code: string }> }) {
  await connection();
  const { code } = await params;
  const ch = await findChallenge(code);
  if (!ch)
    return (
      <div className="text-center">
        <h1 className="font-display text-3xl">Este reto ya no existe</h1>
        <p className="mt-2 text-fog">Los retos duran 90 días. Crea uno nuevo y mándaselo a tus amigos.</p>
        <Link href="/reto" className="btn btn-primary mt-6 h-12 px-6">
          Crear un reto
        </Link>
      </div>
    );

  const user = await getCurrentUser();
  // Solo los datos visibles: la respuesta y la explicación se quedan en el servidor
  const items: PublicChallengeItem[] = ch.exerciseIds.flatMap((id) => {
    const x = EXERCISE_BY_ID.get(id);
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

export default function RetoCodePage(props: PageProps<"/reto/[code]">) {
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
