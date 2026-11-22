import { BookOpen, Flame, ShieldCheck, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageShell } from "@/components/SiteHeader";
import { achievementByShareId } from "@/lib/server/achievement";

export async function generateMetadata(props: PageProps<"/logro/[id]">): Promise<Metadata> {
  // Usa la base de datos y la fecha actual: siempre por petición
  await connection();
  const { id } = await props.params;
  const a = await achievementByShareId(id);
  if (!a) return { title: "Logro", robots: { index: false } };
  const title = `${a.name} es nivel ${a.level.name} en Ciberlearn`;
  return { title, description: "Aprende a detectar estafas digitales, gratis.", robots: { index: false }, openGraph: { title } };
}

async function Card({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const a = await achievementByShareId(id);
  if (!a)
    return (
      <div className="text-center">
        <h1 className="font-display text-3xl">Esta tarjeta ya no está disponible</h1>
        <Link href="/" className="btn btn-primary mt-6 h-12 px-6">
          Conocer Ciberlearn
        </Link>
      </div>
    );

  const stats = [
    { icon: Zap, label: "XP", value: a.xp.toLocaleString("es-SV") },
    { icon: BookOpen, label: "Lecciones", value: `${a.lessons}/${a.totalLessons}` },
    { icon: Flame, label: "Mejor racha", value: `${a.bestStreak} ${a.bestStreak === 1 ? "día" : "días"}` },
  ];

  return (
    <div className="text-center">
      <div className="rounded-3xl bg-[linear-gradient(135deg,#0a0f1c_0%,#102a5c_60%,#2563eb_130%)] p-8 text-white sm:p-12">
        <ShieldCheck className="mx-auto h-14 w-14 text-[#93c5fd]" strokeWidth={1.5} aria-hidden />
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-[#93c5fd]">Detective de estafas</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{a.name}</h1>
        <p className="mt-3 text-xl">
          Nivel {a.level.index}: <strong>{a.level.name}</strong>
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
      <p className="mt-8 text-lg text-fog">¿Tú detectarías una estafa a tiempo?</p>
      <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/diaria" className="btn btn-primary h-12 px-6">
          Probar la estafa del día
        </Link>
        <Link href="/ruta" className="btn btn-ghost h-12 px-6">
          Empezar la ruta gratis
        </Link>
      </div>
    </div>
  );
}

export default function LogroPage(props: PageProps<"/logro/[id]">) {
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
