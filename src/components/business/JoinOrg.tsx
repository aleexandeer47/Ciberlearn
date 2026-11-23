import { Building2, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { joinOrgAction } from "@/app/actions/org";
import { orgActive, type OrgKind } from "@/lib/business";
import type { Lang } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { LEGAL, ORG_CONSENT_FIELD, orgConsentText } from "@/lib/legal";
import { SITE } from "@/lib/site";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

const ERRORS: Record<Lang, Record<OrgKind, Record<string, string>>> = {
  es: {
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
      full: "Este plan familiar ya está completo.",
      "other-org": "Ya perteneces a otra familia o empresa. Sal de ella para unirte a esta.",
      already: "Ya eres parte de esta familia.",
    },
  },
  en: {
    empresa: {
      consentimiento: "To join, tick the authorization box.",
      invalid: "This link isn't valid or was changed. Ask your manager for a new one.",
      inactive: "This company's plan isn't active. Let your manager know.",
      full: "The company has used all its seats. Ask your manager to add more.",
      "other-org": "You already belong to another company or family. Leave it to join this one.",
      already: "You're already part of this company.",
    },
    familia: {
      consentimiento: "To join, tick the authorization box.",
      invalid: "This link isn't valid or was changed. Ask whoever invited you for a new one.",
      inactive: "This family's plan isn't active. Let whoever manages it know.",
      full: "This family plan is already full.",
      "other-org": "You already belong to another family or company. Leave it to join this one.",
      already: "You're already part of this family.",
    },
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
  const { lang, t } = await getT();
  const errors = ERRORS[lang][kind];
  const error = typeof sp.error === "string" ? errors[sp.error] : undefined;
  const home = kind === "familia" ? "/familia" : "/empresa";

  const { orgs } = await collections();
  const org = await orgs.findOne({ inviteCode: code }, { projection: { name: 1, paidUntil: 1, seats: 1, memberCount: 1, kind: 1 } });
  const user = await getCurrentUser();
  const here = `${home}/unirse/${encodeURIComponent(code)}`;

  if (!org || (org.kind ?? "empresa") !== kind) {
    return (
      <Box>
        <h1 className="font-display text-3xl">{t("Enlace no válido", "Invalid link")}</h1>
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
      <p className="eyebrow mt-6">{t("Invitación", "Invitation")}</p>
      <h1 className="mt-2 font-display text-3xl">{t(`Únete a ${org.name}`, `Join ${org.name}`)}</h1>
      <p className="mt-3 text-fog">
        {t(
          `Tendrás el plan Pro de ${SITE.name} sin costo mientras ${org.name} tenga su plan activo.`,
          `You'll get ${SITE.name} Pro at no cost while ${org.name} keeps its plan active.`,
        )}
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-bad/15 px-4 py-3 text-sm text-bad-text">
          {error}
        </p>
      )}
      {!active && !error && <p className="mt-6 rounded-xl bg-desk-3 px-4 py-3 text-sm text-fog">{errors.inactive}</p>}
      {active && full && !error && <p className="mt-6 rounded-xl bg-desk-3 px-4 py-3 text-sm text-fog">{errors.full}</p>}

      {user?.org?._id.equals(org._id) ? (
        <Link href={home} className="btn btn-primary mt-8 px-6 py-3.5">
          {kind === "familia" ? t("Ya eres parte: ir a mi familia", "You're in: go to my family") : t("Ya eres parte: ir a mi empresa", "You're in: go to my company")}
        </Link>
      ) : !user ? (
        <div className="mt-8 grid gap-3">
          <Link href={`/registro?next=${encodeURIComponent(here)}`} className="btn btn-primary px-6 py-3.5">
            {t("Crear mi cuenta para unirme", "Create my account to join")}
          </Link>
          <Link href={`/entrar?next=${encodeURIComponent(here)}`} className="btn btn-ghost px-6 py-3">
            {t("Ya tengo cuenta", "I already have an account")}
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
                {orgConsentText(org.name, kind, lang)}{" "}
                {t("Puedo salir cuando quiera. Más detalles en la", "I can leave whenever I want. More details in the")}{" "}
                <Link
                  href={`${LEGAL.privacidad.path}#${kind === "familia" ? "familia" : "empresa"}`}
                  target="_blank"
                  className="font-medium text-chalk underline underline-offset-2"
                >
                  {t("Política de privacidad", "Privacy policy")}
                </Link>
                .
              </span>
            </label>
            <button type="submit" className="btn btn-primary w-full px-6 py-3.5">
              {t(`Unirme a ${org.name}`, `Join ${org.name}`)}
            </button>
            <p className="text-center text-xs text-fog">
              {t("Entraste como", "Logged in as")} {user.email}
            </p>
          </form>
        )
      )}
    </Box>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md text-center">{children}</div>;
}
