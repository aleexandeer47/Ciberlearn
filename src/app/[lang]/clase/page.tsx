import { GraduationCap, School, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { createClass, leaveClass } from "@/app/actions/school";
import { JoinClassForm } from "@/components/school/JoinClassForm";
import { PageShell } from "@/components/SiteHeader";
import type { T } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { SCHOOL } from "@/lib/school";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    alternates: await alternatesFor("/clase"),
    title: t("Modo colegio", "Class mode"),
    description: t(
      "Gratis para docentes: crea tu clase, comparte un código y mira el avance de tus estudiantes.",
      "Free for teachers: create your class, share a code and see your students' progress.",
    ),
  };
}

const messages = (t: T): Record<string, [string, "ok" | "bad"]> => ({
  unido: [t("¡Listo! Ya estás en la clase. Tu docente verá tu avance.", "Done! You're in the class. Your teacher will see your progress."), "ok"],
  borrada: [t("La clase fue eliminada.", "The class was deleted."), "ok"],
  nombre: [t("Escribe un nombre para la clase (2 a 60 caracteres).", "Enter a class name (2 to 60 characters)."), "bad"],
  "limite-clases": [t(`Puedes tener hasta ${SCHOOL.classesPerTeacher} clases.`, `You can have up to ${SCHOOL.classesPerTeacher} classes.`), "bad"],
  intenta: [t("No pudimos crear la clase. Intenta de nuevo.", "We couldn't create the class. Please try again."), "bad"],
});

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-desk-line bg-desk-2 p-6 ${className}`}>{children}</section>;
}

async function Content({ searchParams }: { searchParams: PageProps<"/[lang]/clase">["searchParams"] }) {
  await connection();
  const sp = await searchParams;
  const [user, { t }] = await Promise.all([getCurrentUser(), getT()]);
  const MSG = messages(t);
  const key = ["unido", "borrada"].find((k) => sp[k] === "1") ?? (typeof sp.error === "string" ? sp.error : undefined);
  const notice = key ? MSG[key] : undefined;
  const code = typeof sp.codigo === "string" ? sp.codigo.slice(0, 9) : "";

  let teaching: { id: string; name: string; code: string; n: number }[] = [];
  let studying: { id: string; name: string }[] = [];
  if (user) {
    const { classes, classMembers } = await collections();
    const [mine, memberships] = await Promise.all([
      classes.find({ teacherId: user._id }).sort({ createdAt: -1 }).toArray(),
      classMembers.find({ userId: user._id }).toArray(),
    ]);
    const counts = await classMembers
      .aggregate<{ _id: unknown; n: number }>([{ $match: { classId: { $in: mine.map((c) => c._id) } } }, { $group: { _id: "$classId", n: { $sum: 1 } } }])
      .toArray();
    const countBy = new Map(counts.map((c) => [String(c._id), c.n]));
    teaching = mine.map((c) => ({ id: c._id.toHexString(), name: c.name, code: c.code, n: countBy.get(String(c._id)) ?? 0 }));
    const joined = await classes.find({ _id: { $in: memberships.map((m) => m.classId) } }, { projection: { name: 1 } }).toArray();
    studying = joined.map((c) => ({ id: c._id.toHexString(), name: c.name }));
  }

  return (
    <div className="space-y-8">
      {notice && (
        <p role={notice[1] === "bad" ? "alert" : "status"} className={`rounded-2xl px-4 py-3 text-sm ${notice[1] === "ok" ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad-text"}`}>
          {notice[0]}
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-brand" aria-hidden />
            <h2 className="font-display text-2xl">{t("Soy estudiante", "I'm a student")}</h2>
          </div>
          <p className="mb-5 mt-1 text-sm text-fog">{t("Escribe el código que te dio tu docente.", "Enter the code your teacher gave you.")}</p>
          {user ? (
            <JoinClassForm defaultCode={code} />
          ) : (
            <Link href={`/registro?next=${encodeURIComponent(`/clase${code ? `?codigo=${code}` : ""}`)}`} className="btn btn-primary h-12 w-full px-6">
              {t("Crear mi cuenta para unirme", "Create my account to join")}
            </Link>
          )}
          {studying.length > 0 && (
            <ul className="mt-6 divide-y divide-desk-line rounded-2xl border border-desk-line">
              {studying.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="font-medium">{c.name}</span>
                  <form action={leaveClass}>
                    <input type="hidden" name="classId" value={c.id} />
                    <button type="submit" className="text-fog hover:text-bad-text">
                      {t("Salir", "Leave")}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <School className="h-6 w-6 text-brand" aria-hidden />
            <h2 className="font-display text-2xl">{t("Soy docente", "I'm a teacher")}</h2>
          </div>
          <p className="mb-5 mt-1 text-sm text-fog">
            {t(
              `Crea una clase gratis, comparte el código y mira cómo avanza cada estudiante. Hasta ${SCHOOL.studentsPerClass} por clase.`,
              `Create a class for free, share the code and see how each student is doing. Up to ${SCHOOL.studentsPerClass} per class.`,
            )}
          </p>
          {user ? (
            <form action={createClass} className="flex gap-2">
              <input name="name" required minLength={2} maxLength={60} placeholder={t("Ej.: 9.º grado B", "E.g. 9th grade B")} className="field min-w-0 flex-1" />
              <button type="submit" className="btn btn-primary h-12 shrink-0 px-5">
                {t("Crear clase", "Create class")}
              </button>
            </form>
          ) : (
            <Link href="/registro?next=/clase" className="btn btn-primary h-12 w-full px-6">
              {t("Crear mi cuenta de docente", "Create my teacher account")}
            </Link>
          )}
          {teaching.length > 0 && (
            <ul className="mt-6 divide-y divide-desk-line rounded-2xl border border-desk-line">
              {teaching.map((c) => (
                <li key={c.id}>
                  <Link href={`/clase/${c.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-desk-3">
                    <span className="font-medium">{c.name}</span>
                    <span className="flex items-center gap-3 text-fog">
                      <span className="font-mono">{c.code}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" aria-hidden /> {c.n}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

export default async function ClasePage(props: PageProps<"/[lang]/clase">) {
  const { t } = await getT();
  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px]">
        <span className="eyebrow">{t("Modo colegio · gratis", "Class mode · free")}</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{t("Aprendan juntos a detectar estafas", "Learn to spot scams together")}</h1>
        <p className="mb-10 mt-3 max-w-2xl text-lg text-fog">
          {t(
            "Para colegios, universidades y talleres: el docente crea una clase, los estudiantes entran con un código y practican con la ruta, la estafa del día y los retos.",
            "For schools, universities and workshops: the teacher creates a class, students join with a code and practice with the path, the scam of the day and challenges.",
          )}
        </p>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-desk-3" />}>
          <Content searchParams={props.searchParams} />
        </Suspense>
      </div>
    </PageShell>
  );
}
