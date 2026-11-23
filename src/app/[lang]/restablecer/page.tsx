import { createHash } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ResetForm } from "@/components/auth/ResetForm";
import { PageShell } from "@/components/SiteHeader";
import { getT } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Nueva contraseña", "New password"), robots: { index: false } };
}

async function Reset({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  await connection();
  const { t } = await getT();
  // Se revisa antes de mostrar el formulario para avisar de una vez si el enlace no sirve.
  const { passwordResets } = await collections();
  const valid =
    token.length > 20 &&
    !!(await passwordResets.findOne({
      tokenHash: createHash("sha256").update(token).digest("hex"),
      usedAt: null,
      expiresAt: { $gt: new Date() },
    }));

  if (!valid) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold">{t("Este enlace ya no sirve", "This link no longer works")}</h1>
        <p className="mt-2 text-fog">
          {t("Venció o ya se usó. Los enlaces duran 1 hora y funcionan una sola vez.", "It expired or was already used. Links last 1 hour and work only once.")}
        </p>
        <Link href="/recuperar" className="btn btn-primary mt-6 px-6 py-3">
          {t("Pedir un enlace nuevo", "Request a new link")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl font-semibold">{t("Elige tu nueva contraseña", "Choose your new password")}</h1>
      <p className="mb-6 mt-1 text-sm text-fog">{t("Después entrarás directo a tu progreso.", "Then you'll go straight to your progress.")}</p>
      <ResetForm token={token} />
    </>
  );
}

export default function RestablecerPage(props: PageProps<"/[lang]/restablecer">) {
  return (
    <PageShell>
      <div className="mx-auto max-w-md rounded-3xl border border-desk-line bg-desk-2 p-6 sm:p-8">
        <Suspense fallback={<div className="h-64" />}>
          <Reset searchParams={props.searchParams as Promise<{ token?: string }>} />
        </Suspense>
      </div>
    </PageShell>
  );
}
