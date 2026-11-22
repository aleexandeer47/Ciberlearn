import { CalendarDays, Check, Flame, Lock, Play, Trophy, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Hearts } from "@/components/path/Hearts";
import { PageShell } from "@/components/SiteHeader";
import { view } from "@/lib/lives";
import { isUnlocked, LESSON_ORDER, UNITS, type Unit } from "@/lib/path/content";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Ruta guiada",
  description: "Aprende a detectar estafas paso a paso: lecciones cortas, vidas y XP.",
};

// Desplazamiento en zigzag de los nodos, como un camino
const OFFSETS = ["0px", "56px", "0px", "-56px"];

/** Encabezado de cada unidad con su nivel; la prueba final (Experto) tiene su propio estilo. */
function UnitBanner({ unit, index }: { unit: Unit; index: number }) {
  const expert = unit.level === "Experto";
  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 text-white ${expert ? "bg-[#0b1220] ring-2 ring-[#f59e0b]" : "bg-brand"}`}>
      {expert && (
        <Flame
          className="pointer-events-none absolute -bottom-6 -right-4 h-36 w-36 text-[#f59e0b] opacity-15"
          strokeWidth={1.5}
          aria-hidden
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold opacity-80">{expert ? "Prueba final" : `Unidad ${index + 1}`}</p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${
            expert ? "bg-[#f59e0b] text-[#0b1220]" : "bg-white/20"
          }`}
        >
          {unit.level}
        </span>
      </div>
      <h2 className="mt-1 font-display text-2xl">{unit.title}</h2>
      <p className="mt-1 max-w-xl opacity-90">{unit.description}</p>
      {expert && (
        <p className="mt-3 text-sm font-semibold text-[#fbbf24]">
          {unit.lessons[0].exercises.length} preguntas por lección. Lee cada detalle.
        </p>
      )}
    </div>
  );
}

async function PathMap() {
  // Las vidas dependen de la hora actual: siempre por petición.
  await connection();
  const user = await getCurrentUser();
  let completed = new Set<string>();
  let lives = view(null, false);
  let xp = 0;
  if (user) {
    const { users } = await collections();
    const doc = await users.findOne({ _id: user._id }, { projection: { path: 1, lives: 1, xp: 1 } });
    completed = new Set(doc?.path?.completed ?? []);
    lives = view(doc?.lives, user.isPro);
    xp = doc?.xp ?? 0;
  }
  const current = LESSON_ORDER.find((id) => !completed.has(id) && isUnlocked(id, completed));
  const doneCount = completed.size;

  return (
    <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[1fr_300px]">
      <div>
        <span className="eyebrow">Ruta guiada</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Aprende a no caer, paso a paso</h1>
        <p className="mt-3 max-w-xl text-lg text-fog">
          Lecciones de 2 minutos. Cada error cuesta una vida; las vidas vuelven solas con el tiempo.
        </p>

        <div className="mt-12 space-y-14">
          {UNITS.map((unit, u) => (
            <section key={unit.id}>
              <UnitBanner unit={unit} index={u} />
              <ol className="mt-8 flex flex-col items-center gap-6">
                {unit.lessons.map((lesson, l) => {
                  const done = completed.has(lesson.id);
                  const open = isUnlocked(lesson.id, completed);
                  const isCurrent = lesson.id === current;
                  const href = !user ? `/registro?next=/ruta/${lesson.id}` : open ? `/ruta/${lesson.id}` : undefined;
                  const node = (
                    <span
                      className={`grid h-20 w-20 place-items-center rounded-full border-b-[6px] transition-transform duration-150 ${
                        done
                          ? "border-[#b45309] bg-[#f59e0b] text-white"
                          : open
                            ? "border-brand-dark bg-brand text-white group-hover:-translate-y-0.5 group-active:translate-y-0.5"
                            : "border-desk-line bg-desk-3 text-fog"
                      } ${isCurrent ? "ring-4 ring-brand/30 ring-offset-4 ring-offset-desk" : ""}`}
                    >
                      {done ? (
                        <Check className="h-9 w-9" strokeWidth={3} aria-hidden />
                      ) : open ? (
                        <Play className="h-8 w-8 fill-current" strokeWidth={1.5} aria-hidden />
                      ) : (
                        <Lock className="h-7 w-7" strokeWidth={2} aria-hidden />
                      )}
                    </span>
                  );
                  return (
                    <li key={lesson.id} className="flex flex-col items-center" style={{ transform: `translateX(${OFFSETS[l % 4]})` }}>
                      {isCurrent && (
                        <span className="mb-2 rounded-xl border border-desk-line bg-desk-2 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-brand">
                          Empieza aquí
                        </span>
                      )}
                      {href ? (
                        <Link href={href} className="group" aria-label={`${lesson.title}${done ? " (completada)" : ""}`}>
                          {node}
                        </Link>
                      ) : (
                        <span aria-label={`${lesson.title} (bloqueada)`}>{node}</span>
                      )}
                      <span className={`mt-2 text-sm font-medium ${open || done ? "" : "text-fog"}`}>{lesson.title}</span>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      </div>

      {/* Panel lateral */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {user ? (
          <>
            <div className="rounded-3xl border border-desk-line bg-desk-2 p-5">
              <p className="text-sm text-fog">Vidas</p>
              <div className="mt-2">
                <Hearts lives={lives} />
              </div>
              {!user.isPro && (
                <Link href="/planes" className="mt-4 block text-sm font-semibold text-brand hover:underline">
                  Vidas infinitas con Pro
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-desk-line bg-desk-2 p-5">
                <Zap className="h-5 w-5 text-[#f59e0b]" strokeWidth={2} aria-hidden />
                <p className="mt-2 font-display text-3xl tabular-nums">{xp}</p>
                <p className="text-xs text-fog">XP total</p>
              </div>
              <div className="rounded-3xl border border-desk-line bg-desk-2 p-5">
                <Check className="h-5 w-5 text-ok" strokeWidth={2.5} aria-hidden />
                <p className="mt-2 font-display text-3xl tabular-nums">
                  {doneCount}/{LESSON_ORDER.length}
                </p>
                <p className="text-xs text-fog">lecciones</p>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl bg-field p-6">
            <p className="font-semibold">Guarda tu avance</p>
            <p className="mt-1 text-sm text-graphite">Crea tu cuenta gratis para empezar la ruta, ganar XP y entrar al ranking.</p>
            <Link href="/registro?next=/ruta" className="btn btn-primary mt-4 h-11 w-full">
              Crear cuenta gratis
            </Link>
          </div>
        )}
        <Link
          href="/diaria"
          className="flex items-center gap-3 rounded-3xl border border-desk-line bg-desk-2 p-5 transition-colors hover:border-brand"
        >
          <CalendarDays className="h-6 w-6 text-[#f97316]" strokeWidth={1.75} aria-hidden />
          <span>
            <span className="block font-semibold">La estafa del día</span>
            <span className="text-sm text-fog">Un caso nuevo hoy · 30 segundos</span>
          </span>
        </Link>
        <Link
          href="/ranking"
          className="flex items-center gap-3 rounded-3xl border border-desk-line bg-desk-2 p-5 transition-colors hover:border-brand"
        >
          <Trophy className="h-6 w-6 text-[#f59e0b]" strokeWidth={1.75} aria-hidden />
          <span>
            <span className="block font-semibold">Ranking mundial</span>
            <span className="text-sm text-fog">Compara tu XP con el resto</span>
          </span>
        </Link>
      </aside>
    </div>
  );
}

export default function RutaPage() {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-[80vh] max-w-[1100px] animate-pulse rounded-3xl bg-desk-3" />}>
        <PathMap />
      </Suspense>
    </PageShell>
  );
}
