import { Swords } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createChallenge } from "@/app/actions/challenge";
import { PageShell } from "@/components/SiteHeader";
import { CHALLENGE_SIZE } from "@/lib/community";
import { LOCALE } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("Reta a un amigo", "Challenge a friend"),
    description: t(
      `Crea un reto de ${CHALLENGE_SIZE} mensajes, mándalo por WhatsApp y mira quién detecta más estafas.`,
      `Create a ${CHALLENGE_SIZE}-message challenge, send it over WhatsApp and see who spots the most scams.`,
    ),
  };
}

async function Mine({ error }: { error?: string }) {
  const [user, { lang, t }] = await Promise.all([getCurrentUser(), getT()]);
  if (!user)
    return (
      <Link href="/registro?next=/reto" className="btn btn-primary h-12 px-6">
        {t("Crea tu cuenta para retar", "Sign up to challenge friends")}
      </Link>
    );
  const { challenges } = await collections();
  const list = await challenges.find({ creatorId: user._id }).sort({ createdAt: -1 }).limit(8).toArray();
  return (
    <div className="space-y-8">
      <form action={createChallenge}>
        <button type="submit" className="btn btn-primary h-12 px-6">
          <Swords className="h-4 w-4" strokeWidth={2} aria-hidden />
          {t("Crear un reto nuevo", "Create a new challenge")}
        </button>
        {error === "limite" && (
          <p className="mt-3 text-sm text-bad-text">
            {t("Llegaste al límite de retos por hoy. Vuelve mañana.", "You reached today's challenge limit. Come back tomorrow.")}
          </p>
        )}
      </form>
      {list.length > 0 && (
        <section>
          <h2 className="font-display text-xl">{t("Tus retos", "Your challenges")}</h2>
          <ul className="mt-3 divide-y divide-desk-line rounded-2xl border border-desk-line bg-desk-2">
            {list.map((c) => (
              <li key={c.code}>
                <Link href={`/reto/${c.code}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-desk-3">
                  <span>
                    {c.createdAt.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "short" })} ·{" "}
                    {c.creatorScore === null
                      ? t("aún no lo juegas", "not played yet")
                      : t(`tu marca ${c.creatorScore}/${CHALLENGE_SIZE}`, `your score ${c.creatorScore}/${CHALLENGE_SIZE}`)}
                  </span>
                  <span className="text-fog">
                    {c.plays} {c.plays === 1 ? t("persona lo jugó", "person played it") : t("personas lo jugaron", "people played it")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default async function RetoPage(props: PageProps<"/[lang]/reto">) {
  const { t } = await getT();
  const STEPS = [
    [
      t("Crea tu reto", "Create your challenge"),
      t(
        `Te damos ${CHALLENGE_SIZE} mensajes al azar. Juégalo primero: tu puntaje es la marca a vencer.`,
        `We give you ${CHALLENGE_SIZE} random messages. Play it first: your score is the one to beat.`,
      ),
    ],
    [
      t("Mándalo", "Send it"),
      t("Comparte el enlace por WhatsApp o redes. Tus amigos juegan sin crear cuenta.", "Share the link over WhatsApp or social media. Your friends play without signing up."),
    ],
    [
      t("Compara", "Compare"),
      t("Cada quien ve su resultado, las respuestas explicadas y la tabla del reto.", "Everyone sees their result, the answers explained and the challenge leaderboard."),
    ],
  ];
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <span className="eyebrow">{t("Reto entre amigos", "Challenge with friends")}</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{t("¿Quién cae primero?", "Who falls for it first?")}</h1>
        <p className="mt-3 max-w-xl text-lg text-fog">
          {t(
            "Reta a tu familia, amigos o compañeros de trabajo. Es la forma más rápida de que todos aprendan a detectar estafas.",
            "Challenge your family, friends or coworkers. It's the fastest way for everyone to learn to spot scams.",
          )}
        </p>
        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map(([title, d], n) => (
            <li key={title} className="rounded-3xl border border-desk-line bg-desk-2 p-5">
              <span className="font-display text-3xl text-brand">{n + 1}</span>
              <p className="mt-2 font-semibold">{title}</p>
              <p className="mt-1 text-sm text-fog">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Suspense fallback={<div className="h-12 w-56 animate-pulse rounded-xl bg-desk-3" />}>
            <MineWithParams searchParams={props.searchParams} />
          </Suspense>
        </div>
      </div>
    </PageShell>
  );
}

async function MineWithParams({ searchParams }: { searchParams: PageProps<"/[lang]/reto">["searchParams"] }) {
  const sp = await searchParams;
  return <Mine error={typeof sp.error === "string" ? sp.error : undefined} />;
}
