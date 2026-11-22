import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { LessonPlayer } from "@/components/path/LessonPlayer";
import { SiteHeader } from "@/components/SiteHeader";
import { view } from "@/lib/lives";
import { isUnlocked, LESSON_BY_ID, LESSON_ORDER, publicLesson } from "@/lib/path/content";
import { collections } from "@/lib/server/db";
import { extraUnlocked, getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Lección", robots: { index: false } };

export function generateStaticParams() {
  return LESSON_ORDER.map((leccion) => ({ leccion }));
}

async function Lesson({ params }: { params: Promise<{ leccion: string }> }) {
  const { leccion } = await params;
  const lesson = LESSON_BY_ID.get(leccion);
  if (!lesson) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/entrar?next=/ruta/${leccion}`);
  const { users } = await collections();
  const doc = await users.findOne({ _id: user._id }, { projection: { path: 1, lives: 1 } });
  if (!isUnlocked(leccion, new Set(doc?.path?.completed ?? [])) && !extraUnlocked(user).has(leccion)) redirect("/ruta");

  // Solo se manda la lección sin respuestas
  return <LessonPlayer lesson={publicLesson(lesson)} initialLives={view(doc?.lives, user.isPro)} />;
}

export default function LeccionPage(props: PageProps<"/ruta/[leccion]">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<div className="mx-auto mt-16 h-64 max-w-2xl animate-pulse rounded-3xl bg-desk-3" />}>
          <Lesson params={props.params} />
        </Suspense>
      </main>
    </>
  );
}
