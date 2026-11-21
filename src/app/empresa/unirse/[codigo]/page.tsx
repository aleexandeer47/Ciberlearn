import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { joinOrgAction } from "@/app/actions/org";
import { PageShell } from "@/components/SiteHeader";
import { orgActive } from "@/lib/business";
import { LEGAL, ORG_CONSENT_FIELD, orgConsentText } from "@/lib/legal";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Unirme a mi empresa", robots: { index: false } };

const ERRORS: Record<string, string> = {
  consentimiento: "Para unirte, marca la casilla de autorización.",
  invalid: "Este enlace no es válido o fue cambiado. Pide uno nuevo a tu encargado.",
  inactive: "El plan de esta empresa no está activo. Avísale a tu encargado.",
  full: "La empresa ya usó todos sus puestos. Pide a tu encargado que agregue más.",
  "other-org": "Ya perteneces a otra empresa. Sal de ella desde la página Empresa para unirte a esta.",
  already: "Ya eres parte de esta empresa.",
};

async function Join({ params, searchParams }: { params: Promise<{ codigo: string }>; searchParams: PageProps<"/empresa/unirse/[codigo]">["searchParams"] }) {
  // Depende de la base de datos y de la fecha actual: siempre por petición.
  await connection();
  const { codigo } = await params;
  const code = decodeURIComponent(codigo).slice(0, 40);
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? ERRORS[sp.error] : undefined;

  const { orgs } = await collections();
  const org = await orgs.findOne({ inviteCode: code }, { projection: { name: 1, paidUntil: 1, seats: 1, memberCount: 1 } });
  const user = await getCurrentUser();
  const here = `/empresa/unirse/${encodeURIComponent(code)}`;

  if (!org) {
    return (
      <Box>
        <h1 className="font-display text-3xl">Enlace no válido</h1>
        <p className="mt-2 text-fog">{ERRORS.invalid}</p>
      </Box>
    );
  }

  const active = orgActive(org.paidUntil);
  const full = org.memberCount >= org.seats;

  return (
    <Box>
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-field text-brand">
        <Building2 className="h-7 w-7" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="eyebrow mt-6">Invitación</p>
      <h1 className="mt-2 font-display text-3xl">Únete a {org.name}</h1>
      <p className="mt-3 text-fog">
        Tendrás el plan Pro de Ciberlearn sin costo mientras {org.name} tenga su plan activo.
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-bad/15 px-4 py-3 text-sm text-bad-text">
          {error}
        </p>
      )}
      {!active && !error && <p className="mt-6 rounded-xl bg-desk-3 px-4 py-3 text-sm text-fog">{ERRORS.inactive}</p>}
      {active && full && !error && <p className="mt-6 rounded-xl bg-desk-3 px-4 py-3 text-sm text-fog">{ERRORS.full}</p>}

      {user?.org?._id.equals(org._id) ? (
        <Link href="/empresa" className="btn btn-primary mt-8 px-6 py-3.5">
          Ya eres parte: ir a mi empresa
        </Link>
      ) : !user ? (
        <div className="mt-8 grid gap-3">
          <Link href={`/registro?next=${encodeURIComponent(here)}`} className="btn btn-primary px-6 py-3.5">
            Crear mi cuenta para unirme
          </Link>
          <Link href={`/entrar?next=${encodeURIComponent(here)}`} className="btn btn-ghost px-6 py-3">
            Ya tengo cuenta
          </Link>
        </div>
      ) : (
        active &&
        !full && (
          <form action={joinOrgAction} className="mt-8 space-y-5 text-left">
            <input type="hidden" name="code" value={code} />
            <label className="flex gap-3 rounded-2xl border border-desk-line bg-desk-2 p-4 text-sm leading-snug text-graphite">
              <input type="checkbox" name={ORG_CONSENT_FIELD} value="si" required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
              <span>
                {orgConsentText(org.name)} Puedo salir de la empresa cuando quiera. Más detalles en la{" "}
                <Link href={`${LEGAL.privacidad.path}#empresa`} target="_blank" className="font-medium text-chalk underline underline-offset-2">
                  Política de privacidad
                </Link>
                .
              </span>
            </label>
            <button type="submit" className="btn btn-primary w-full px-6 py-3.5">
              Unirme a {org.name}
            </button>
            <p className="text-center text-xs text-fog">Entraste como {user.email}</p>
          </form>
        )
      )}
    </Box>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md text-center">{children}</div>;
}

export default function JoinPage(props: PageProps<"/empresa/unirse/[codigo]">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-80 max-w-md animate-pulse rounded-3xl bg-desk-3" />}>
        <Join params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </PageShell>
  );
}
