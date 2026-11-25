import { ArrowLeft, RefreshCw, Trash2, Trophy, UserMinus } from "lucide-react";
import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { deleteClass, removeStudent, rotateClassCode } from "@/app/actions/school";
import { PageShell } from "@/components/SiteHeader";
import { currentStreak } from "@/lib/daily";
import { dayKey } from "@/lib/dayKey";
import { LOCALE } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { LESSONS } from "@/lib/path/content";
import { collections } from "@/lib/server/db";
import { env } from "@/lib/server/env";
import { getCurrentUser } from "@/lib/server/session";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Mi clase", "My class"), robots: { index: false } };
}

async function Panel({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const { lang, t } = await getT();
  const fmt = (d: Date) => d.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "short" });
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/clase");
  if (!ObjectId.isValid(id)) notFound();
  const { classes, classMembers, users } = await collections();
  const cls = await classes.findOne({ _id: new ObjectId(id), teacherId: user._id });
  // Solo el docente de la clase: para cualquier otra persona la página no existe
  if (!cls) notFound();

  const members = await classMembers.find({ classId: cls._id }).toArray();
  const docs = await users
    .find({ _id: { $in: members.map((m) => m.userId) } }, { projection: { name: 1, xp: 1, path: 1, daily: 1, lastLoginAt: 1 } })
    .toArray();
  const today = dayKey();
  const joinedBy = new Map(members.map((m) => [m.userId.toHexString(), m.joinedAt]));
  const consented = new Set(members.filter((m) => m.profileConsent).map((m) => m.userId.toHexString()));
  const rows = docs
    .map((u) => ({
      id: u._id.toHexString(),
      name: u.name,
      xp: u.xp ?? 0,
      lessons: u.path?.completed?.length ?? 0,
      streak: currentStreak(u.daily, today),
      last: u.lastLoginAt ?? null,
      joined: joinedBy.get(u._id.toHexString()) ?? null,
      full: consented.has(u._id.toHexString()),
    }))
    .sort((a, b) => b.xp - a.xp);
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + (r.lessons / LESSONS.length) * 100, 0) / rows.length) : 0;
  const joinUrl = `${env.appUrl.replace(/^https?:\/\//, "")}/clase`;

  return (
    <div className="space-y-6">
      <Link href="/clase" className="inline-flex items-center gap-1.5 text-sm text-fog hover:text-chalk">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {t("Mis clases", "My classes")}
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">{t("Clase", "Class")}</span>
          <h1 className="mt-2 font-display text-4xl">{cls.name}</h1>
          <p className="mt-1 text-fog">
            {rows.length} {rows.length === 1 ? t("estudiante", "student") : t("estudiantes", "students")} ·{" "}
            {t(`avance promedio de la ruta ${avg}%`, `average path progress ${avg}%`)}
          </p>
        </div>
      </div>

      {/* Código grande para proyectar en clase */}
      <section className="rounded-3xl bg-[linear-gradient(135deg,#0a0f1c,#102a5c_60%,#2563eb_130%)] p-8 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#93c5fd]">
          {t(`Entra a ${joinUrl} y escribe el código`, `Go to ${joinUrl} and enter the code`)}
        </p>
        <p className="mt-4 font-mono text-6xl font-bold tracking-[0.25em] sm:text-7xl">{cls.code}</p>
        <form action={rotateClassCode} className="mt-5">
          <input type="hidden" name="classId" value={id} />
          <button type="submit" className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />{" "}
            {t("Cambiar código (los que ya entraron se quedan)", "Change code (students already in will stay)")}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-3xl border border-desk-line bg-desk-2">
        <div className="flex items-center gap-2 p-6 pb-4">
          <Trophy className="h-5 w-5 text-[#f59e0b]" aria-hidden />
          <h2 className="font-display text-xl">{t("Estudiantes", "Students")}</h2>
        </div>
        {rows.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-fog">{t("Aún no entra nadie. Comparte el código de arriba.", "Nobody has joined yet. Share the code above.")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-y border-desk-line bg-desk-3 text-xs text-fog">
                <tr>
                  <th className="px-6 py-2.5 font-medium">#</th>
                  <th className="px-3 py-2.5 font-medium">{t("Estudiante (toca para ver su perfil)", "Student (tap to see profile)")}</th>
                  <th className="px-3 py-2.5 font-medium">{t("Lecciones", "Lessons")}</th>
                  <th className="px-3 py-2.5 font-medium">XP</th>
                  <th className="px-3 py-2.5 font-medium">{t("Racha", "Streak")}</th>
                  <th className="px-3 py-2.5 font-medium">{t("Última vez", "Last seen")}</th>
                  <th className="px-6 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-desk-line">
                {rows.map((r, n) => (
                  <tr key={r.id}>
                    <td className="px-6 py-3 tabular-nums text-fog">{n + 1}</td>
                    <td className="px-3 py-3 font-medium">
                      <Link href={`/clase/${id}/estudiante/${r.id}`} className="hover:text-brand hover:underline">
                        {r.name}
                      </Link>
                      {!r.full && (
                        <span className="ml-2 rounded-full bg-desk-3 px-2 py-0.5 text-[10px] font-normal text-fog" title={t("Aún no autoriza que veas su perfil completo", "Hasn't authorized their full profile yet")}>
                          {t("perfil sin autorizar", "profile not authorized")}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {r.lessons}/{LESSONS.length}
                    </td>
                    <td className="px-3 py-3 tabular-nums">{r.xp}</td>
                    <td className="px-3 py-3 tabular-nums">{r.streak ? `${r.streak} d` : "—"}</td>
                    <td className="px-3 py-3 text-fog">{r.last ? fmt(r.last) : "—"}</td>
                    <td className="px-6 py-3 text-right">
                      <form action={removeStudent}>
                        <input type="hidden" name="classId" value={id} />
                        <input type="hidden" name="userId" value={r.id} />
                        <button type="submit" className="text-fog hover:text-bad-text" aria-label={t(`Quitar a ${r.name} de la clase`, `Remove ${r.name} from the class`)}>
                          <UserMinus className="h-4 w-4" aria-hidden />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-field p-6 text-sm text-graphite">
        <p className="font-semibold text-chalk">{t("Ideas para la clase", "Ideas for class")}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>{t("Empiecen cada clase con la estafa del día y comenten por qué era trampa o real.", "Start each class with the scam of the day and discuss why it was a scam or real.")}</li>
          <li>{t("Creen un reto de 5 mensajes y compártanlo en el grupo: ¿quién saca más?", "Create a 5-message challenge and share it in the group: who scores highest?")}</li>
          <li>{t("Pidan una lección de la ruta por semana; aquí ves quién va al día.", "Assign one path lesson a week; here you can see who's keeping up.")}</li>
        </ul>
      </section>

      <form action={deleteClass} className="text-right">
        <input type="hidden" name="classId" value={id} />
        <button type="submit" className="inline-flex items-center gap-1.5 text-sm text-fog hover:text-bad-text">
          <Trash2 className="h-4 w-4" aria-hidden /> {t("Eliminar la clase", "Delete the class")}
        </button>
      </form>
    </div>
  );
}

export default function ClaseDetallePage(props: PageProps<"/[lang]/clase/[id]">) {
  return (
    <PageShell>
      <div className="mx-auto max-w-[1000px]">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-desk-3" />}>
          <Panel params={props.params} />
        </Suspense>
      </div>
    </PageShell>
  );
}
