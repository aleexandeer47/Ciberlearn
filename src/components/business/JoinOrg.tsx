import { Building2, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { joinOrgAction } from "@/app/actions/org";
import { orgActive, type OrgKind } from "@/lib/business";
import { LEGAL, ORG_CONSENT_FIELD, orgConsentText } from "@/lib/legal";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

const ERRORS: Record<OrgKind, Record<string, string>> = {
  empresa: {
    consentimiento: "Para unirte, marca la casilla de autorización.",
    invalid: "Este enlace no es válido o fue cambiado. Pide uno nuevo a tu encargado.",
    inactive: "El plan de esta empresa no está activo. Avísale a tu encargado.",
    full: "La empresa ya usó todos sus puestos. Pide a tu encargado que agregue más.",
    "other-org": "Ya perteneces a otra empresa o familia. Sal de ella para unirte a esta.",
    already: "Ya eres parte de esta empresa.",
  },
  familia: {
    consentimiento: "Para unirte, marca la casilla de autorización.",
    invalid: "Este enlace no es válido o fue cambiado. Pide uno nuevo a quien te invitó.",
    inactive: "El plan de esta familia no está activo. Avísale a quien lo administra.",
    full: `Este plan familiar ya está completo.`,
    "other-org": "Ya perteneces a otra familia o empresa. Sal de ella para unirte a esta.",
    already: "Ya eres parte de esta familia.",
  },
};

/** Página de invitación (empresa o familia): explica qué se comparte y pide la autorización. */
export async function JoinOrg({
  kind,
  params,
  searchParams,
}: {
  kind: OrgKind;
  params: Promise<{ codigo: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Depende de la base de datos y de la fecha actual: siempre por petición.
  await connection();
  const { codigo } = await params;
  const code = decodeURIComponent(codigo).slice(0, 40);
  const sp = await searchParams;
  const errors = ERRORS[kind];
  const error = typeof sp.error === "string" ? errors[sp.error] : undefined;
  const home = kind === "familia" ? "/familia" : "/empresa";

  const { orgs } = await collections();
  const org = await orgs.findOne({ inviteCode: code }, { projection: { name: 1, paidUntil: 1, seats: 1, memberCount: 1, kind: 1 } });
  const user = await getCurrentUser();
  const here = `${home}/unirse/${encodeURIComponent(code)}`;

  if (!org || (org.kind ?? "empresa") !== kind) {
    return (
      <Box>
        <h1 className="font-display text-3xl">Enlace no válido</h1>
        <p className="mt-2 text-fog">{errors.invalid}</p>
      </Box>
    );
  }

  const active = orgActive(org.paidUntil);
  const full = org.memberCount >= org.seats;
  const Icon = kind === "familia" ? HeartHandshake : Building2;

  return (
    <Box>
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-field text-brand">
        <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="eyebrow mt-6">Invitación</p>
      <h1 className="mt-2 font-display text-3xl">Únete a {org.name}</h1>
      <p className="mt-3 text-fog">Tendrás el plan Pro de Ciberlearn sin costo mientras {org.name} tenga su plan activo.</p>

      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-bad/15 px-4 py-3 text-sm text-bad-text">
          {error}
        </p>
      )}
      {!active && !error && <p className="mt-6 rounded-xl bg-desk-3 px-4 py-3 text-sm text-fog">{errors.inactive}</p>}
      {active && full && !error && <p className="mt-6 rounded-xl bg-desk-3 px-4 py-3 text-sm text-fog">{errors.full}</p>}

      {user?.org?._id.equals(org._id) ? (
        <Link href={home} className="btn btn-primary mt-8 px-6 py-3.5">
          Ya eres parte: ir a {kind === "familia" ? "mi familia" : "mi empresa"}
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
            <input type="hidden" name="kind" value={kind} />
            <label className="flex gap-3 rounded-2xl border border-desk-line bg-desk-2 p-4 text-sm leading-snug text-graphite">
              <input type="checkbox" name={ORG_CONSENT_FIELD} value="si" required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
              <span>
                {orgConsentText(org.name, kind)} Puedo salir cuando quiera. Más detalles en la{" "}
                <Link
                  href={`${LEGAL.privacidad.path}#${kind === "familia" ? "familia" : "empresa"}`}
                  target="_blank"
                  className="font-medium text-chalk underline underline-offset-2"
                >
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
