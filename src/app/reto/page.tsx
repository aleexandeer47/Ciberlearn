import { Swords } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createChallenge } from "@/app/actions/challenge";
import { PageShell } from "@/components/SiteHeader";
import { CHALLENGE_SIZE } from "@/lib/community";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Reta a un amigo",
  description: `Crea un reto de ${CHALLENGE_SIZE} mensajes, mándalo por WhatsApp y mira quién detecta más estafas.`,
};

const STEPS = [
  ["Crea tu reto", `Te damos ${CHALLENGE_SIZE} mensajes al azar. Juégalo primero: tu puntaje es la marca a vencer.`],
  ["Mándalo", "Comparte el enlace por WhatsApp o redes. Tus amigos juegan sin crear cuenta."],
  ["Compara", "Cada quien ve su resultado, las respuestas explicadas y la tabla del reto."],
];

async function Mine({ error }: { error?: string }) {
  const user = await getCurrentUser();
  if (!user)
    return (
      <Link href="/registro?next=/reto" className="btn btn-primary h-12 px-6">
        Crea tu cuenta para retar
      </Link>
    );
  const { challenges } = await collections();
  const list = await challenges.find({ creatorId: user._id }).sort({ createdAt: -1 }).limit(8).toArray();
  return (
    <div className="space-y-8">
      <form action={createChallenge}>
        <button type="submit" className="btn btn-primary h-12 px-6">
          <Swords className="h-4 w-4" strokeWidth={2} aria-hidden />
          Crear un reto nuevo
        </button>
        {error === "limite" && <p className="mt-3 text-sm text-bad-text">Llegaste al límite de retos por hoy. Vuelve mañana.</p>}
      </form>
      {list.length > 0 && (
        <section>
          <h2 className="font-display text-xl">Tus retos</h2>
          <ul className="mt-3 divide-y divide-desk-line rounded-2xl border border-desk-line bg-desk-2">
            {list.map((c) => (
              <li key={c.code}>
                <Link href={`/reto/${c.code}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-desk-3">
                  <span>
                    {c.createdAt.toLocaleDateString("es-SV", { day: "numeric", month: "short" })} ·{" "}
                    {c.creatorScore === null ? "aún no lo juegas" : `tu marca ${c.creatorScore}/${CHALLENGE_SIZE}`}
                  </span>
                  <span className="text-fog">
                    {c.plays} {c.plays === 1 ? "persona lo jugó" : "personas lo jugaron"}
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

export default async function RetoPage(props: PageProps<"/reto">) {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <span className="eyebrow">Reto entre amigos</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">¿Quién cae primero?</h1>
        <p className="mt-3 max-w-xl text-lg text-fog">
          Reta a tu familia, amigos o compañeros de trabajo. Es la forma más rápida de que todos aprendan a detectar estafas.
        </p>
        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map(([t, d], n) => (
            <li key={t} className="rounded-3xl border border-desk-line bg-desk-2 p-5">
              <span className="font-display text-3xl text-brand">{n + 1}</span>
              <p className="mt-2 font-semibold">{t}</p>
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

async function MineWithParams({ searchParams }: { searchParams: PageProps<"/reto">["searchParams"] }) {
  const sp = await searchParams;
  return <Mine error={typeof sp.error === "string" ? sp.error : undefined} />;
}
